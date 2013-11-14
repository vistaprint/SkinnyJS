/* globals Window */

(function (window, $) {
    var cacheBuster = 1;

    var browserSupportsPostMessage = !! window.postMessage;

    // Given a URL, returns the domain portion (i.e. http://www.somedomain.com)
    function getDomainFromUrl(url) {
        return url.replace(/([^:]+:\/\/[^\/]+).*/, "$1");
    }

    // Given a domain pattern (i.e. http://somedomain.com) matches against a specified domain

    // * {String or Function} originPatternOrFunction: A pattern or a function to match against sourceOrigin
    // * {String} sourceOrigin: The string to match using the originPatternOrFunction
    function isOriginMatch(originPatternOrFunction, sourceOrigin) {
        if (typeof (originPatternOrFunction) == "string" &&
            sourceOrigin !== originPatternOrFunction &&
            originPatternOrFunction !== "*") {
            return false;
        } else if ($.isFunction(originPatternOrFunction) && !originPatternOrFunction(sourceOrigin)) {
            return false;
        }

        return true;
    }

    // Try to find the relationship between the current window
    // and a provided window reference.

    // * {Window} window: Current window or window sending event.
    // * {Window} target: Target window
    // * {number} level: Do not pass originally. Used only by recursion.

    // Will return a short reference string or false if cannot be found.
    function transverseLevel(window, target, level) {
        var i;

        if (typeof level == "undefined") {
            level = 0;
        }

        // Try to find the target in window.frames
        if (window.frames) {
            try {
                for (i = 0; i < window.frames.length; i++) {
                    try {
                        if (window.frames[i] === target) {
                            return "f," + i;
                        }
                    } catch (e) {
                        if (e.number !== -2147024891) // WTF is this?
                        {
                            throw e;
                        }
                    }
                }
            } catch (ex) {
                if (ex.number !== -2146823279) // and, WTF is this?
                {
                    throw ex;
                }
            }
        }

        // Try to find the target in window.parent
        if (window.parent && window.parent === target) {
            return "p";
        }

        // Try to find the target in window.opener
        if (window.opener && window.opener === target) {
            return "o";
        }

        // Prevent infinite recursion. 
        // There's really no good reason you need 4 levels deep of frames!
        if (level >= 4) {
            return false;
        }

        var ref;

        // Recurse through window.frames
        if (window.frames && window.frames.length > 0) {
            for (i = 0; i < window.frames.length; i++) {
                ref = transverseLevel(window.frames[i], target, level + 1);
                if (ref) {
                    return "f," + i + "." + ref;
                }
            }
        }

        // Recurse through window.parent
        if (window.parent && window.parent !== window) {
            ref = transverseLevel(window.parent, target, level + 1);
            if (ref) {
                return "p." + ref;
            }
        }

        // Recurse through window.opener
        if (window.opener && window.opener !== window) {
            ref = transverseLevel(window.opener, target, level + 1);
            if (ref) {
                return "o" + ref;
            }
        }

        return false;
    }

    // 1. Find the relationship between current and target window.
    // 2. Serialize a string path from the current to the target window.
    // Example: f,0.f,0 translates to window.frames[0].frames[0]
    // Example: p.p translates to window.parent.parent

    // * {Window} currentWindow: Starting window
    // * {Window|string} targetWindow: Window to determine reference to.
    function serializeWindowReference(currentWindow, targetWindow) {
        // If the target window was opened with window.open(), its name is the only
        // way to get to it. This makes for a yucky API, unfortunately.
        if (typeof (targetWindow) == "string") {
            return ":" + targetWindow;
        }

        // first see if we can quickly find the reference
        if (currentWindow === targetWindow) {
            throw new Error("Trying to postMessage to self. Pointlessly useless.");
        }

        // see if the target is simple the parent
        if (currentWindow.parent && currentWindow.parent !== currentWindow && currentWindow.parent === targetWindow) {
            return "p";
        }

        // see if the target is simply the opener
        if (currentWindow.opener && currentWindow.opener !== currentWindow && currentWindow.opener === targetWindow) {
            return "o";
        }

        // Try to determine the relationship through recursion.
        var ref = transverseLevel(currentWindow, targetWindow);
        if (ref) {
            return ref;
        } else {
            throw new Error("Couldn't serialize window reference");
        }
    }

    // Sends a message to a window in a different domain.
    // * {String} message: The message to send
    // * {String} targetHost: The domain of the window to which the message should be sent
    //                               (i.e. http://www.something.com)
    // * {Window} targetWindow: A reference to the target window to which the message should be sent
    // * {string} targetWindowName: If the target window is a child window (not a frame), the window name
    //                               is required for browsers that don"t support postMessage() natively.
    $.postMessage = function (message, targetHost, targetWindow, /* optional */ targetWindowName) {
        if (!targetHost) {
            throw new Error("targetHost argument was not supplied to jQuery.postMessage");
        }

        if (!targetWindow) {
            throw new Error("No targetWindow specified");
        }

        targetHost = getDomainFromUrl(targetHost);

        // native works for:

        // * Opera 12.12 (build 1707, x64, Win7)
        // * Chrome 24.0.1312.56 m (Win7)
        // * Firefox 18.0.1 (Win7)
        if (browserSupportsPostMessage) {
            try {
                targetWindow.postMessage(message, targetHost);
                return;
            } catch (ex) {
                // In IE (all known versions), postMessage() works only for iframes within the same
                // top-level window, and will fail with "No such interface supported" for calls between top-level windows.

                // * <http://blogs.msdn.com/b/ieinternals/archive/2009/09/16/bugs-in-ie8-support-for-html5-postmessage-sessionstorage-and-localstorage.aspx>
                // * <http://blogs.msdn.com/b/thebeebs/archive/2011/12/21/postmessage-popups-and-ie.aspx>

                // No such interface supported. Fall through to the polyfill technique.
                if (ex.number != -2147467262) {
                    throw ex;
                }
            }
        }

        // The browser does not support window.postMessage.
        // First, lets see if we can get direct access to the window instead.
        // This will only work if the target window is in the same domain.
        try {
            var postMessageDirect = targetWindow.__receiveMessageHook;
            if (postMessageDirect) {
                postMessageDirect(message, targetHost);
                return;
            }
        } catch (ex) {}

        // Direct access wont work because the targetWindow is in a different domain.
        // Create an iframe in the same domain as the target window and use it as a proxy to talk
        // to the target window. Pass the proxy information in an encoded URL fragment,
        // (not a querystring, which would cause it to load from the server)
        var serializedWindowRef = serializeWindowReference(window, targetWindowName || targetWindow),
            thisDomain = getDomainFromUrl(document.location.href),
            iframe = document.createElement("iframe");

        if (!targetHost || targetHost == "*") {
            throw new Error("$.postMessage(): Must specify targetHost on browsers that don't support postMessage natively (cannot be '*').");
        }

        $("body").append(
            $(iframe)
            .hide()
            .attr("src", targetHost + getPolyfillPath() + "#" +
                // When server side debugging, add (+new Date()) here
                (+new Date()) + cacheBuster + "&" +
                serializedWindowRef + "&" + thisDomain + "&" + encodeURIComponent(message)
            )
            .load(function () {
                // remove this DOM iframe once it is no longer needed
                $(iframe).remove();
            })
        );

        cacheBuster++;
    };

    // Assigns an event handler (callback) to receive messages sent to the window, from the specified origin.

    // * {function(Object)} callback: The event handler function to call when a message is received
    // * {string|function(string)} allowedOriginOrFunction: Either a domain string (i.e. http://www.something.com),
    //                                                     a wildcard (i.e. "*"), or a function that takes domain
    //                                                     strings and returns true or false.
    $.receiveMessage = function (callback, allowedOriginOrFunction) {
        if (!callback) {
            throw new Error("No callback function specified");
        }

        if (!allowedOriginOrFunction) {
            allowedOriginOrFunction = "*";
        }

        $(window).on("message", function (event, data, origin) {
            if (!data) {
                data = event.originalEvent ? event.originalEvent.data : event.data;
            }

            if (!origin) {
                origin = event.originalEvent ? event.originalEvent.origin : event.origin;
            }

            return isOriginMatch(allowedOriginOrFunction, event.originalEvent ? event.originalEvent.origin : origin) ?
                callback({
                    "data": data,
                    "origin": origin
                }) :
                false;
        });
    };

    // Windows in IE can only handle onmessage events from IFRAMEs within the same parent window only.
    // Messages sent between top level windows will fail. Unfortunately, we don't know if the calling window is
    // an IFrame or top-level window. To work around, listen for calls from the polyfill technique for IE in all cases.
    window.__receiveMessageHook = function (message, origin) {
        var $evt = new $.Event("message");
        $evt.data = message;
        $evt.origin = origin;

        $(window).trigger($evt, [$evt.data, $evt.origin]);
    };

    // Convenience wrapper for windows wrapped in jQuery objects
    $.fn.postMessage = function (message, targetHost, /* optional */ targetWindowName) {
        this.each(function (i, el) {
            if (!(el instanceof Window)) {
                throw new Error("postMessage can only be sent to a window");
            }

            $.postMessage(message, targetHost, el, targetWindowName);
        });

        return this;
    };

    $.event.special.message = {
        add: function (handlerData) {
            var origHandler = handlerData.handler;

            handlerData.handler = function (e, message, origin) {
                e.data = e.originalEvent ? e.originalEvent.data : message;
                e.origin = e.originalEvent ? e.originalEvent.origin : origin;

                return origHandler.call(this, e, e.data, e.origin);
            };
        }
    };

    var getPolyfillPath = function () {
        if (!window._jqueryPostMessagePolyfillPath) {
            throw new Error("Must configure jquery.postMessage() with window._jqueryPostMessagePolyfillPath for IE7 support. Should be '/root-relative-path-on-my-server/postmessage.htm'");
        }

        return window._jqueryPostMessagePolyfillPath;
    };

})(window, jQuery);
