(function (window, $) {
    var _currentScripts;

    $.fn.partialLoad = function (url, target, data, callback) {
        // Default to a GET request
        var type = "GET";
        var response;

        // Overload simulation
        // if target is a function, assume its a callback
        if (jQuery.isFunction(target)) {
            callback = target;
            target = undefined;
        } else if (data) {
            // If the third param is a function, assume that it's the callback
            if (jQuery.isFunction(data)) {
                callback = data;
                data = undefined;
            }
            // Otherwise, its data to POST
            else if (typeof data === "object") {
                data = jQuery.param(data, jQuery.ajaxSettings.traditional);
                type = "POST";
            }
        }

        var self = this;

        // This section derived from the internals of jQuery.fn.load()

        // Request the remote document
        $.ajax({
            url: url,
            type: type,
            dataType: "html",
            data: data
        }).done(function (responseText) {
            // Save response for use in complete callback
            response = arguments;

            self.each(function (i, el) {
                var $el = $(el);
                var scripts = [];
                var fragment = getFragmentAndScripts(responseText, target, $el, scripts);

                // This call might cause exceptions, but we still want the callbacks to happen
                try {
                    // See if a selector was specified
                    $el.html(fragment);

                    if (scripts.length) {
                        $.each(scripts, function (i, elem) {
                            if (elem.src) {
                                // Load scripts that haven't yet been loaded
                                execScriptUnique(elem.src);
                            } else {
                                // Execute inline scripts. No way to de-dupe these.
                                $.globalEval((elem.text || elem.textContent || elem.innerHTML || "").replace(rcleanScript, "/*$0*/"));
                            }
                        });
                    }
                } catch (e) {
                    // suppressing these errors
                }
            });

        }).complete(callback && function (jqXHR, status) {
            self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
        });

        return this;
    };

    var execScriptUnique = function (src) {
        var srcLower = src.toLowerCase();

        // Build a 'set' of already loaded scripts so we can ensure
        // that they don't get loaded more than once.
        if (!_currentScripts) {
            _currentScripts = {};

            var currentScripts = document.getElementsByTagName("SCRIPT");
            for (var i = 0; i < currentScripts.length; i++) {
                if (currentScripts[i].src) {
                    _currentScripts[currentScripts[i].src.toLowerCase()] = true;
                }
            }
        }

        // This script is already loaded. Don't load it again.
        if (_currentScripts[srcLower]) {
            return;
        }

        _currentScripts[srcLower] = true;

        $.ajax({
            type: "GET",
            global: false,
            url: src,
            async: false,
            dataType: "script"
        });
    };

    var _currentStylesheets;

    var isStylesheetUnique = function (href) {
        var hrefLower = href.toLowerCase();

        // Build a 'set' of already loaded scripts so we can ensure
        // that they don't get loaded more than once.
        if (!_currentStylesheets) {
            _currentStylesheets = {};

            var currentStylesheets = document.getElementsByTagName("LINK");
            for (var i = 0; i < currentStylesheets.length; i++) {
                if (currentStylesheets[i].href) {
                    _currentStylesheets[currentStylesheets[i].href.toLowerCase()] = true;
                }
            }
        }

        // This stylesheet is already loaded. Don't load it again.
        if (_currentStylesheets[hrefLower]) {
            return false;
        }

        _currentStylesheets[hrefLower] = true;

        return true;
    };

    var rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/;

    var getFragmentAndScripts = function (responseText, selector, context, scripts) {
        var $target;

        if (selector) {

            var $temp = $("<div>");

            // A selector was specified. Load only the fragment.
            // This will cause scripts in the fragment to be executed by jQuery.fn.html().
            $temp[0].innerHTML = responseText;

            $target = $temp.find(selector);

            $target.find("script").map(function (i, elem) {
                scripts.push(elem);
            });

        } else {

            // HACK: jQuery 1.9 changed the signature of $.buildFragment() to expect a raw DOM document object,
            // whereas previous versions expected a jQuery object, and would look up its ownerDocument.
            if (compareVersion(jqueryVersion(), [1, 9, 0]) >= 0) {
                context = context[0].ownerDocument;
            }

            // No selector was specified. Load all scripts on the page, as long as they haven't been loaded before.
            var fragment = $.buildFragment([responseText], context, scripts);

            $target = fragment.fragment || fragment;
        }

        if (scripts.length) {
            $.each(scripts, function (i, elem) {
                if (elem.parentNode) {
                    elem.parentNode.removeChild(elem);
                }
            });
        }

        // Remove meta, link
        // Preserve title: These don't hurt anything, and the modal dialog framework uses them
        // to get the title of the dialog.
        var REMOVE_LIST = {
            META: true,
            LINK: true,
            NOSCRIPT: true
        };

        var nodes = $target.jquery ? $target : $target.childNodes;

        if (nodes) {
            for (var i = nodes.length - 1; i >= 0; i--) {
                var child = nodes[i];

                if (REMOVE_LIST[child.tagName]) {

                    // Only remove stylesheets that have already been added
                    if (child.tagName == "LINK" && child.rel.toLowerCase() == "stylesheet" && child.href) {
                        if (isStylesheetUnique(child.href)) {
                            continue;
                        }
                    }

                    $target.removeChild(child);
                }
            }
        }

        return $target;
    };

    function jqueryVersion() {
        return $.map(
            $.fn.jquery.split("."),
            function (value) {
                return parseInt(value, 10);
            });
    }

    function compareVersion(v1, v2) {
        for (var i = 0; i < 3; i++) {
            if (v1[i] != v2[i]) {
                return (v1[i] > v2[i]) ? 1 : -1;
            }
        }

        return 0;
    }

})(window, jQuery);
