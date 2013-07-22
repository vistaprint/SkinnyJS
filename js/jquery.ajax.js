/*jsl:option explicit*/
/// <reference path="../jquery-current.js" />
/// <reference path="../../ThirdParty/json2.js" />
/// <reference path="../../ThirdParty/js-iso8601.js" />

/** 
 * @fileoverview Global ajax plugin for jQuery
 *
 * @author Laban Eilers leilers@vistaprint.com
 */
(function(window, $)
{
    //Because we want to surface ajax errors (and trap them with global error handlers for logging), 
    //All ajax calls done in jquery.ajax which encounter an error should throw an exception
    //if they don't already have an explicit error handler specified.
    //NOTE: adding a fail() handler to the Deferred object returned by $.ajax() doesn't prevent
    //this default logging. You would explicitly need to handle the error by specifying a 
    //settings.error handler.

    $(document).ajaxError(function (e, xhr, settings, ex)
    {
        if (!settings.error)
        {
            //TODO can we publish the actual json with the exception?
            throw new Error(ex + " from $.ajax(): " + settings.url);
        }
    });

    /**
    * Remove ASMX specific metadata from JSON
    */

    var msJsonSanitizer = function(key, value)
    {
        if (typeof(value) == "string")
        {   
            return msJsonDateOnlySanitizer(key, value);
        }
        else if (typeof(value) == "object")
        {
            if (value && value.__type)
            {
                delete value.__type; //ASMX adds a "__type" property which is unnecessary.
            }
        }

        return value;
    };
    
    var msJsonDateOnlySanitizer = function(key, value)
    {
        if (typeof(value) == "string")
        {   
            // Perform strict parsing so that strings that are not full dates are not parsed as dates
            // Example of a partial date:       "2013"
            // Example of a full ISO8601 date:  "2013-08-07T21:40:05.121+06:00"
            
            var date = Date.parseISO8601(value, true); //Depends on ms date parsing in js-iso8601.js. True indicates to perform strict parsing.
            if (!isNaN(date))
            {
                return date;
            }

            date = Date.parseMsDate(value); //Depends on ms date parsing in js-iso8601.js. This function is already strict.
            if (!isNaN(date))
            {
                return date;
            }
        }

        return value;
    };

    /**
    * Parses Microsoft JSON, removes the outer container, and revives it.
    */
    $.parseMsJSON = function(text, preserveType)
    {
        if (!text)
        {
            return {};
        }
        
        var json = JSON.parse(text, preserveType ? msJsonDateOnlySanitizer : msJsonSanitizer);

        if (!json)
        {
            return {};
        }

        //ASMX puts all JSON in a "d" property.

        return typeof json.d != "undefined" ? json.d : json;
    };

    var recurseJSON = function(holder, key, reviver) 
    {
        var k, v, value = holder[key];
        if (value && typeof value == "object") 
        {
            for (k in value) 
            {
                if (Object.prototype.hasOwnProperty.call(value, k)) 
                {
                    v = recurseJSON(value, k, reviver);
                    if (v !== undefined) 
                    {
                        value[k] = v;
                    } 
                    else 
                    {
                        delete value[k];
                    }
                }
            }
        }

        return reviver.call(holder, key, value);
    };

    // Recurses over a json data structure and runs the specified reviver function
    $.recurseJSON = function(json, reviver)
    {
        return recurseJSON({"": json}, "", reviver);
    };

    // Recurses over a json data structure output by Microsoft JSON serialization, and revives it.
    $.reviveMsJSON = function(json, datesOnly)
    {
        return $.recurseJSON(json, datesOnly ? msJsonDateOnlySanitizer : msJsonSanitizer);
    };

    var AJAX_SETTINGS_DEFAULTS = {
            dataType: "json",
            type: "post",
            contentType: "application/json; charset=utf-8",
            converters: {"text json": $.parseMsJSON } //Parse and sanitize the JSON returned by ASMX
        };

    var validateSetting = function(settings, arg, methodName)
    {
        if (!settings[arg])
        {
            throw new Error(methodName + ": " + arg + " not specified");
        }
    };

    var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/; 

    $.stringifyMsDate = function(key, value) 
    { 
        if (typeof value == "string") 
        { 
            var a = reISO.exec(value); 
            if (a) { 
                var val = '/Date(' + new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6])).getTime() + '-0000)/';

                this[key] = val; 
                return val; 
            } 
        } 
        return value;
    };

    // Similar to $.load(), though this will execute scripts on the target page more intelligently.
    // If a target selector is passed, it will load only the target DOM fragment into the current DOM element.
    // In this case, it will execute all javascripts in the target DOM. Inline scripts in the target DOM will also be executed.
    // If no target selector is passed, it will load ALL scripts on the requested page, 
    // EXCEPT for scripts that have been loaded on the host page already.
    // Inline scripts from the whole page will be executed.

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
        jQuery.ajax({
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
                            jQuery.each(scripts, function(i, elem) 
                            {
                                if (elem.src) 
                                {
                                    // Load scripts that haven't yet beeb loaded
                                    execScriptUnique(elem.src);
                                } 
                                else 
                                {
                                    // Execute inline scripts. No way to de-dupe these.
                                    jQuery.globalEval((elem.text || elem.textContent || elem.innerHTML || "").replace(rcleanScript, "/*$0*/"));
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

        jQuery.ajax({
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
        var temp = jQuery("<div>");

        if (selector)
        {
            // A selector was specified. Load only the fragment.
            // This will cause scripts in the fragment to be executed by jQuery.html().
            temp[0].innerHTML = responseText;
            return temp.find(selector);
        }
        else
        {
            // No selector was specified. Load all scripts on the page, as long as they haven't been loaded before.

            var fragment = jQuery.buildFragment([responseText], context, scripts);

            if (scripts.length) 
            {
                jQuery.each(scripts, function(i, elem) 
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

    /**
    * Invoke $.ajax() with all the correct settings and wrappers for Microsoft script services such as ASMX and WCF.
    * Otherwise identical to $.ajax() (same settings, arguments, and return values).
    * @return jQuery.Deferred
    */
    $.ajaxMs = function(url, settings)
    {
        if (!settings)
        {
            settings = {};
        }

        if (typeof url == "object")
        {
            settings = url;
        }
        else if (typeof url == "string")
        {
            settings.url = url;
        }

        //Validate settings

        validateSetting(settings, "url", "$.ajaxAsmx");

        //Format the data as JSON before post

        if (settings.data)
        {
            settings.data = JSON.stringify(settings.data, $.stringifyMsDate); 
        }

        //In ASMX (and REST in general), web service method name gets appended to the URL

        if (settings.methodName)
        {
            settings.url += "/" + settings.methodName; 
        }

        var coalescedSettings = {};
        $.extend(true, coalescedSettings, AJAX_SETTINGS_DEFAULTS, settings);
        
        //Useful for testing invalid json
//        settings.dataFilter = function(data, type)
//        {
//            return "{d:{ 'foo': '/Date(1325394000000-0500)/' }}";
//        };
        
        //For a sync call, return the parsed JSON

        if (coalescedSettings.async === false)
        {
            var xhr = $.ajax(coalescedSettings);
            return $.parseMsJSON(xhr.responseText, coalescedSettings.preserveType);
        }

        return $.ajax(coalescedSettings);
    };

    $.ajaxAsmx = $.ajaxMs;
    $.ajaxWcf = $.ajaxMs;

})(window, jQuery);
