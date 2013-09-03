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

        // Overload simulation
        if (data) 
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

        // Request the remote document
        $.ajax({
            url: url,
            type: type,
            dataType: "html",
            data: data,
            // Complete callback (responseText is used internally)
            complete: function( jqXHR, status, responseText ) 
            {
                // This section derived from the internals of jQuery.fn.load()

                // Store the response as specified by the jqXHR object
                responseText = jqXHR.responseText;

                // If successful, inject the HTML into all the matched elements
                if (jqXHR.isResolved()) 
                {
                    // jQuery Bug 4825: Get the actual response in case
                    // a dataFilter is present in ajaxSettings
                    jqXHR.done(function(r) 
                    {
                        responseText = r;
                    });

                    var scripts = [];
                    var fragment = getFragmentAndScripts(responseText, target, self, scripts);

                    // This call might cause exceptions, but we still want the callbacks to happen
                    try 
                    {
                        // See if a selector was specified
                        self.html(fragment);

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
                    catch (e) {
                        // suppressing these errors
                    }
                }

                if (callback) 
                {
                    self.each(callback, [responseText, status, jqXHR]);
                }
            }
        });
        
        // TODO: I think there's a jQuery API way to provide access the resulting promise.
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
        var temp = $("<div>");

        if (selector)
        {
            // A selector was specified. Load only the fragment.
            // This will cause scripts in the fragment to be executed by R.html().
            temp[0].innerHTML = responseText;
            return temp.find(selector);
        }
        else
        {
            // No selector was specified. Load all scripts on the page, as long as they haven't been loaded before.
            var fragment = $.buildFragment([responseText], context, scripts);

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

            return fragment.fragment;
        }
    };

})(window, jQuery);
