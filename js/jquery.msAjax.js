/// <reference path="../dependencies/json2.js" />
/// <reference path="../dependencies/js-iso8601-ms.js" />

/** 
 * Support Microsoft web services (ASMX, WCF, JsonDataContractSerializer)
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
