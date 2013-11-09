// Support reading settings from a node dialog's element

// Minimal polyfill for Object.keys
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys>
if (!Object.keys) {
    Object.keys = function(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys[keys.length] = key;
            }
        }
        return keys;
    };
}

(function($) {
    var ATTR_PREFIX = "data-dialog-";

    var parseNone = function(s) {
        return s || null;
    };

    var parseBool = function(s) {
        if (s) {
            s = s.toString().toLowerCase();
            switch (s) {
                case "true":
                case "yes":
                case "1":
                    return true;
                default:
                    break;
            }
        }

        return false;
    };

    var parseFunction = function(body) {
        // Evil is necessary to turn inline HTML handlers into functions
        /* jshint evil: true */

        if (!body) {
            return null;
        }

        return new Function("event", body);
    };

    // The properties to copy from HTML data-dialog-* attributes
    // to the dialog settings object
    var _props = {
        "title": parseNone,
        "onopen": parseFunction,
        "onbeforeopen": parseFunction,
        "onclose": parseFunction,
        "onbeforeclose": parseFunction,
        "maxWidth": parseInt,
        "initialHeight": parseInt,
        "ajax": parseBool,
        "onajaxerror": parseFunction,
        "destroyOnClose": parseBool,
        "skin": parseNone,
        "enableHistory": parseBool,
        "zIndex": parseInt
    };

    $.modalDialog = $.modalDialog || {};

    // Copies the HTML data-dialog-* attributes to the settings object
    $.modalDialog.getSettings = function($el) {
        var settings = {};

        $.each(Object.keys(_props), function(i, key) {
            // $.fn.attr is case insensitive
            var value = $el.attr(ATTR_PREFIX + key);
            if (typeof value != "undefined") {
                var parser = _props[key];
                settings[key] = parser(value);
            }
        });

        return settings;
    };

})(jQuery);
