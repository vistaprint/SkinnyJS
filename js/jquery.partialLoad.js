// Similar to $.load(), though this will execute scripts on the target page more intelligently.
// If a target selector is passed, it will load only the target DOM fragment into the current DOM element.
// In this case, it will execute all javascripts in the target DOM. Inline scripts in the target DOM will also be executed.
// If no target selector is passed, it will load ALL scripts on the requested page, 
// EXCEPT for scripts that have been loaded on the host page already.
// Inline scripts from the whole page will be executed.

(function(window, $)
{
    $.fn.partialLoad = function (url, target, params, callback) 
    {
        // Default to a GET request
        var type = "GET";

        // If the third parameter was provided
        if (params) 
        {
            // If it's a function
            if (jQuery.isFunction(params)) 
            {
                // We assume that it's the callback
                callback = params;
                params = undefined;

            // Otherwise, build a param string
            } 
            else if (typeof params === "object") 
            {
                params = jQuery.param(params, jQuery.ajaxSettings.traditional);
                type = "POST";
            }
        }

        var self = this;

        // Request the remote document
        $.ajax({
            url: url,
            type: type,
            dataType: "html",
            data: params,
            // Complete callback (responseText is used internally)
            complete: function( jqXHR, status, responseText ) {
                // Store the response as specified by the jqXHR object
                responseText = jqXHR.responseText;
                // If successful, inject the HTML into all the matched elements
                if ( jqXHR.isResolved() ) {
                    // #4825: Get the actual response in case
                    // a dataFilter is present in ajaxSettings
                    jqXHR.done(function( r ) {
                        responseText = r;
                    });

                    var scripts = [];
                    var fragment = getFragmentAndScripts(responseText, target, self, scripts);

                    // this call might have exceptions, but we still want the callbacks to happen
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
                                    // Load scripts that haven't yet beeb loaded
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
