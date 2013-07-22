/*jsl:option explicit*/
/* globals Window */
/*
 * @fileoverview jQuery postMessage
 *
 * Wraps HTML5 postMessage for cross-origin message sending between windows.
 * Fallback implementation works on browsers that don't support postMessage.
 *
 * @author Laban Eilers leilers@vistaprint.com
 * @contributor Benjamin Hutchins bhutchins@vistaprint.com (Jan, 2013)
 *
 * Based on concepts from: http://benalman.com/projects/jquery-postmessage-plugin/
 * Improved by using iframes for communication instead of via url fragments and
 * polling. This technique eliminates race conditions where messages sent
 * in rapid succession might not be received. It also removes the need for
 * polling.
 */

(function(window, $) {
    var cacheBuster = 1;

    /**
     * @type {boolean}
     */
    var browserSupportsPostMessage = !!window.postMessage;

    /**
     * Given a URL, returns the domain portion (i.e. http://www.somedomain.com)
     * @param {String} url The url from which to extract the domain
     * @return {String}
     */
    function getDomainFromUrl(url) 
    {
        return url.replace(/([^:]+:\/\/[^\/]+).*/, '$1');
    }

    /**
     * Given a domain pattern (i.e. http://somedomain.com) matches against a specified domain
     * @param {String or Function} originPatternOrFunction
     * @param {String} sourceOrigin The string to match using the originPatternOrFunction
     * @return {Boolean}
     */
    function isOriginMatch(originPatternOrFunction, sourceOrigin) 
    {
        if (typeof(originPatternOrFunction) == "string" && sourceOrigin !== originPatternOrFunction && originPatternOrFunction !== "*")
        {
            return false;
        }
        else if ($.isFunction(originPatternOrFunction) && !originPatternOrFunction(sourceOrigin))
        {
            return false;
        }

        return true;
    }

    /**
     * Try to find the relationship between the current window
     * and a provided window reference.
     *
     * @param {Window} w Current window or window sending event.
     * @param {Window} target Target window
     * @param {number=} level Do not pass originally. Used only by recursion.
     * @return {string|boolean} Will return a short reference string or false if cannot be found.
     */
    function transverseLevel(w, target, level) 
    {
        if (w.frames && w.frames.length > 0) 
        {
            try 
            {
                for (var f in w.frames) 
                {
                    try 
                    {
                        /*jsl:ignore*/
                        if (w.frames[0] instanceof Window && w.frames[f] === target)
                        {
                            return 'f,' + f;
                        }
                        /*jsl:end*/
                    } 
                    catch (e) 
                    {
                        if (e.number !== -2147024891)
                        {
                            throw e;
                        }
                    }
                }
            } 
            catch (ex) 
            {
                if (ex.number !== -2146823279)
                {
                    throw ex;
                }
            }
        }

        if (w.parent && w.parent === target)
        {
            return 'p';
        }

        if (w.opener && w.opener === target)
        {
            return 'o';
        }

        // we have already transversed deep enough
        if (level >= 4) 
        {
            return false;
        }

        var ref;
        
        if (w.frames && w.frames.length > 0) 
        {
            for (var i = 0; i < w.frames.length; i++) 
            {
                ref = transverseLevel(w.frames[i], target, level + 1);
                if (ref) 
                {
                    return 'f,' + i + '.' + ref;
                }
            }
        }

        if (w.parent && w.parent !== w) 
        {
            ref = transverseLevel(w.parent, target, level + 1);
            if (ref) 
            {
                return "p." + ref;
            }
        }

        if (w.opener && w.opener !== w) 
        {
            ref = transverseLevel(w.opener, target, level + 1);
            if (ref) 
            {
                return "o" + ref;
            }
        }

        return false;
    }

    /**
     * 1. Find the relationship between current and target window.
     * 2. Serialized a string path from the current to the target window.
     *
     * Example: f,0.f,0 translates to window.frames[0].frames[0]
     * Example: p.p translates to window.parent.parent
     * @param {Window} currentWindow
     * @param {Window|string} targetWindow Window to determine reference to.
     * @return {string}
     */
    function serializeWindowReference(currentWindow, targetWindow) 
    {
        // If the target window was opened with window.open(), its name is the only
        // way to get to it. This makes for a yucky API, unfortunately.
        if (typeof (targetWindow) == "string")
        {
            return ':' + targetWindow;
        }

        // first see if we can quickly find the reference
        if (currentWindow === targetWindow)
        {
            throw new Error("Trying to postMessage to self. Pointlessly useless.");
        }

        // see if the target is simple the parent
        if (currentWindow.parent && currentWindow.parent !== currentWindow && currentWindow.parent === targetWindow)
        {
            return 'p';
        }

        // see if the target is simply the opener
        if (currentWindow.opener && currentWindow.opener !== currentWindow && currentWindow.opener === targetWindow)
        {
            return 'o';
        }

        // Try to determine the relationship through recursion.
        var ref = transverseLevel(currentWindow, targetWindow);
        if (ref)
        {
            return ref;
        }
        else
        {
            throw new Error("Couldn't serialize window reference");
        }
    }

    /**
    * Sends a message to a window in a different domain.
    * @param {String} message The message to send
    * @param {String} targetOrigin The domain of the window to which the message should be sent
    *                               (i.e. http://www.something.com)
    * @param {Window} targetWindow A reference to the target window to which the message should be sent
    * @param {string} targetWindowName If the target window is a child window (not a frame), the window name
    *                               is required for browsers that don't support postMessage() natively.
    */
    $.postMessage = function(message, targetOrigin, targetWindow, targetWindowName) 
    {
        if (!targetOrigin)
        {
            throw new Error("targetOrigin argument was not supplied to jQuery.postMessage");
        }

        if (!targetWindow)
        {
            throw new Error("No targetWindow specified");
        }

        targetOrigin = getDomainFromUrl(targetOrigin);

        // native works for:
        //   Opera 12.12 (build 1707, x64, Win7)
        //   Chrome 24.0.1312.56 m (Win7)
        //   Firefox 18.0.1 (Win7)
        if (browserSupportsPostMessage) 
        {
            try 
            {
                targetWindow.postMessage(message, targetOrigin);
                return;
            }
            catch (ex) 
            {
                // In IE (all known versions), postMessage() works only for iframes within the same
                // top-level window, and will fail with "No such interface supported" for calls between top-level windows.
                // http://blogs.msdn.com/b/ieinternals/archive/2009/09/16/bugs-in-ie8-support-for-html5-postmessage-sessionstorage-and-localstorage.aspx
                // http://blogs.msdn.com/b/thebeebs/archive/2011/12/21/postmessage-popups-and-ie.aspx

                // No such interface supported. Fall through to the polyfill technique.
                if (ex.number != -2147467262)
                {
                    throw ex;
                }
            }
        }

        // The browser does not support window.postMessage.
        // First, lets see if we can get direct access to the window instead.
        
        try
        {
            var postMessageDirect = targetWindow.__receiveMessageHook;
            if (postMessageDirect)
            {
                postMessageDirect(message, targetOrigin);
                return;
            }
        }
        catch (ex)
        {
        }

        // Direct access wont work because the targetWindow is in a different domain.
        // Create an iframe in the same domain as the target window and use it as a proxy to talk
        // to the target window. Pass the proxy information in an encoded URL fragment,
        // (not a querystring, which would cause it to load from the server)

        var serializedWindowRef = serializeWindowReference(window, targetWindowName || targetWindow),
            thisDomain = getDomainFromUrl(document.location.href),
            iframe = document.createElement('iframe');

        $('body').append(
            $(iframe)
            .hide()
            .attr('src', targetOrigin + '/vp/JS-Lib/jQuery/plugins/postmessage.htm#' +
                // When server side debugging, add (+new Date()) here
                (+new Date()) + cacheBuster + '&' +
                serializedWindowRef + '&' + thisDomain + '&' + encodeURIComponent(message)
            )
            .load(function() {
                // remove this DOM iframe once it is no longer needed
                $(iframe).remove();
            })
        );

        cacheBuster++;
    };

    /**
     * Assigns an event handler (callback) to receive messages sent to the window, from the specified origin.
     * @param {function(Object)} callback The event handler function to call when a message is received
     * @param {string|function(string)} allowedOriginOrFunction Either a domain string (i.e. http://www.something.com),
     *                                                     a wildcard (i.e. "*"), or a function that takes domain
     *                                                     strings and returns true or false.
     */
    $.receiveMessage = function(callback, allowedOriginOrFunction) 
    {
        if (!callback)
        {
            throw new Error("No callback function specified");
        }

        if (!allowedOriginOrFunction)
        {
            throw new Error("No allowedOriginOrFunction specified");
        }

        $(window).on('message', function(event, data, origin) 
        {
            if (!data) 
            {
                data = event.originalEvent ? event.originalEvent.data : event.data;
            }

            if (!origin) 
            {
                origin = event.originalEvent ? event.originalEvent.origin : event.origin;
            }

            return isOriginMatch(allowedOriginOrFunction, event.originalEvent ? event.originalEvent.origin : origin) ?
                callback({ 'data': data, 'origin': origin }) : 
                false;
        });
   };

    /**
     * Windows in IE can only handle onmessage events from IFRAMEs within the same parent window only.
     * Messages sent between top level windows will fail. Unfortunately, we don't know if the calling window is
     * an IFrame or top-level window. To work around, listen for calls from the polyfill technique for IE in all cases.
     */
    window.__receiveMessageHook = function(message, origin) 
    {
        $(window).trigger('message', decodeURIComponent(message), origin);
    };

})(window, jQuery);