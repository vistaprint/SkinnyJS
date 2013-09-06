// ## jQuery.partialLoad

// Similar to $.load(), though this will execute scripts on the target page more intelligently.

// If a target selector is passed, it will load only the target DOM fragment into the current DOM element.
// In this case, it will execute all scripts in the target DOM. Inline scripts in the target DOM will also be executed.
// If no target selector is passed, it will load ALL scripts on the requested page, 
// EXCEPT for scripts that have been loaded on the host page already.
// Inline scripts from the whole page will be executed.

// ### Usage

//     $(".contentRegion").partialLoad( // The jQuery object's DOM element will be populated with the web service content
//          "/some-html-content", // The URL of the web service
//          ".interesting-part", // A selector defining the DOM elements you want to extract from the HTML returned by the web service
//          { somekey: "somevalue" }, // (optional) A data object. If supplied, it will be POSTed to the web service
//          myCallback); // A callback fired when the load is complete (or fails)

// ### Source

(function(window, $)
{
    $.fn.partialLoad = function (url, target, data, callback) 
    {
        // Default to a GET request
        var type = "GET";
        var response;

        // Overload simulation
        // if target is a function, assume its a callback
        if (jQuery.isFunction(target)) 
        {
            callback = target;
            target = undefined;
        } 
        else if (data) 
        {
            // If the third param is a function, assume that it's the callback
            if (jQuery.isFunction(data)) 
            {
                callback = data;
                data = undefined;
            } 
            // Otherwise, its data to POST
            else if (typeof data === "object") 
            {
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
        }).done(function(responseText)
        {
            // Save response for use in complete callback
            response = arguments;

            self.each(function(i, el)
            {
                var $el = $(el);
                var scripts = [];
                var fragment = getFragmentAndScripts(responseText, target, $el, scripts);

                // This call might cause exceptions, but we still want the callbacks to happen
                try 
                {
                    // See if a selector was specified
                    $el.html(fragment);

                    if (scripts.length) 
                    {
                        $.each(scripts, function(i, elem) 
                        {
                            if (elem.src) 
                            {
                                // Load scripts that haven't yet been loaded
                                execScriptUnique(elem.src);
                            } 
                            else 
                            {
                                // Execute inline scripts. No way to de-dupe these.
                                $.globalEval((elem.text || elem.textContent || elem.innerHTML || "").replace(rcleanScript, "/*$0*/"));
                            }
                        });
                    }
                }
                catch (e) 
                {
                    // suppressing these errors
                }
            });

        }).complete(callback && function(jqXHR, status) 
        {
            self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
        });
        
        return this;
    };

    var execScriptUnique = function(src)
    {
        var srcLower = src.toLowerCase();

        // Build a 'set' of already loaded scripts so we can ensure
        // that they don't get loaded more than once.
        if (!window.__currentScripts)
        {
            window.__currentScripts = {};

            var currentScripts = document.getElementsByTagName("SCRIPT");
            for (var i=0; i<currentScripts.length; i++)
            {
                if (currentScripts[i].src)
                {
                    window.__currentScripts[currentScripts[i].src.toLowerCase()] = true;
                }
            }
        }

        // This script is already loaded. Don't load it again.
        if (window.__currentScripts[srcLower])
        {
            return;
        }

        window.__currentScripts[srcLower] = true;

        $.ajax({
            type: "GET",
            global: false,
            url: src,
            async: false,
            dataType: "script"
        });
    };

    var rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/;

    var getFragmentAndScripts = function(responseText, selector, context, scripts)
    {
        // HACK: jQuery 1.9 changed the signature of $.buildFragment() to expect a raw DOM document object,
        // whereas previous versions expected a jQuery object, and would look up its ownerDocument.
        if (parseFloat($.fn.jquery.substr(0, 3)) >= 1.9)
        {
            context = context[0].ownerDocument;
        }

        var $target;

        if (selector)
        {
            var $temp = $("<div>");

            // A selector was specified. Load only the fragment.
            // This will cause scripts in the fragment to be executed by jQuery.fn.html().
            $temp[0].innerHTML = responseText;

            $target = $temp.find(selector);

            $target.find("script").map(function(i, elem)
            {
                scripts.push(elem);
            });
        }
        else
        {
            // No selector was specified. Load all scripts on the page, as long as they haven't been loaded before.
            var fragment = $.buildFragment([responseText], context, scripts);

            $target = fragment.fragment || fragment;
        }

        if (scripts.length) 
        {
            $.each(scripts, function(i, elem) 
            {
                if (elem.parentNode)
                {
                    elem.parentNode.removeChild(elem);
                }
            });
        }

        return $target;
    };

})(window, jQuery);
