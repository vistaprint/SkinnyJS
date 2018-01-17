/// <reference path="../dependencies/json2.js" />
/// <reference path="date-parse.js" />

(function (window, $) {
    // Remove ASMX specific metadata from JSON
    var msJsonSanitizer = function (key, value) {
        // Rehydrate date values
        if (typeof (value) == "string") {
            return msJsonDateOnlySanitizer(key, value);
        } else if (typeof (value) == "object") {
            // ASMX adds a "__type" property to aid in return-trip deserialization.
            // This isn't useful most of the time.
            if (value && value.__type) {
                delete value.__type;
            }
        }

        return value;
    };

    // Converts date strings in ISO8601 or Microsoft format to JavaScript dates
    var msJsonDateOnlySanitizer = function (key, value) {
        if (typeof (value) == "string") {
            // Perform strict parsing so that strings that are not full dates are not parsed as dates
            // Example of a partial date:       "2013"
            // Example of a full ISO8601 date:  "2013-08-07T21:40:05.121+06:00"
            if (!$.parseMsJSON.isNumericString(value)) {
                var date = Date.parseISO(value) ||
                    Date.parseMsDate(value) ||
                    (value.indexOf("GMT") >= 0 ? Date.parse(value) : NaN);
                if (!isNaN(date)) {
                    return new Date(date);
                }
            }
        }

        return value;
    };

    // Parses Microsoft JSON, removes the outer container, and revives it.
    $.parseMsJSON = function (text, preserveType) {
        if (!text) {
            return {};
        }

        var json = JSON.parse(text, preserveType ? msJsonDateOnlySanitizer : msJsonSanitizer);

        if (!json) {
            return {};
        }

        // ASMX puts all JSON in a "d" property.

        return typeof json.d != "undefined" ? json.d : json;
    };

    $.parseMsJSON.isNumericString = function (value) {
        return new RegExp(/^-?[0-9]+\.?[0-9]*$/).test(value);
    };

    // Recurses through a JSON object and applies the specified reviver
    var recurseJSON = function (holder, key, reviver) {
        var k, v, value = holder[key];
        if (value && typeof value == "object") {
            for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    v = recurseJSON(value, k, reviver);
                    if (v !== undefined) {
                        value[k] = v;
                    } else {
                        delete value[k];
                    }
                }
            }
        }

        return reviver.call(holder, key, value);
    };

    // Recurses over a json data structure and runs the specified reviver function
    $.recurseJSON = function (json, reviver) {
        return recurseJSON({
            "": json
        }, "", reviver);
    };

    // Recurses over a json data structure output by Microsoft JSON serialization, and revives it.
    $.reviveMsJSON = function (json, datesOnly) {
        return $.recurseJSON(json, datesOnly ? msJsonDateOnlySanitizer : msJsonSanitizer);
    };

    var AJAX_SETTINGS_DEFAULTS = {
        dataType: "json",
        type: "post",
        contentType: "application/json; charset=utf-8",
        converters: {
            "text json": $.parseMsJSON
        } //Parse and sanitize the JSON returned by ASMX
    };

    var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;

    // A reviver/replacer for JSON.stringify() that converts dates into Microsoft format
    $.stringifyMsDate = function (key, value) {
        if (typeof value == "string") {
            var a = reISO.exec(value);
            if (a) {
                var val = "/Date(" + new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6])).getTime() + "-0000)/";

                this[key] = val;
                return val;
            }
        }
        return value;
    };


    // Invoke $.ajax() with all the correct settings and wrappers for Microsoft script services such as ASMX and WCF.
    // Otherwise identical to $.ajax() (same settings, arguments, and return values).
    $.msAjax = function (url, settings) {
        if (!settings) {
            settings = {};
        }

        if (typeof url == "object") {
            settings = url;
        } else if (typeof url == "string") {
            settings.url = url;
        }

        // Validate settings
        if (!settings.url) {
            throw new Error("$.msAjax: url not specified");
        }

        // Format the data as JSON before post
        if (settings.data) {
            settings.data = JSON.stringify(settings.data, $.stringifyMsDate);
        }

        // In ASMX (and REST in general), web service method name gets appended to the URL
        if (settings.methodName) {
            settings.url += "/" + settings.methodName;
        }

        var coalescedSettings = {};
        $.extend(true, coalescedSettings, AJAX_SETTINGS_DEFAULTS, settings);

        // For a sync call, return the parsed JSON
        if (coalescedSettings.async === false) {
            var xhr = $.ajax(coalescedSettings);
            return $.parseMsJSON(xhr.responseText, coalescedSettings.preserveType);
        }

        return $.ajax(coalescedSettings);
    };

    $.ajaxAsmx = $.msAjax;
    $.ajaxWcf = $.msAjax;


})(window, jQuery);
