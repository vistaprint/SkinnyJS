// Support reading settings from a tutorialOverlay's element

// Minimal polyfill for Object.keys
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys>
if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys[keys.length] = key;
            }
        }
        return keys;
    };
}

(function ($) {
    var ATTR_PREFIX = "data-overlay-";

    var parseNone = function (s) {
        return s || null;
    };

    var parseBool = function (s) {
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

    // The properties to copy from HTML data-overlay-* attributes
    // to the overlay settings object
    var _props = {
        "overlayId": parseNone,
        "centerContent": parseNone,
        "containerElement": parseNone,
        "hideOnClick": parseBool,
        "zIndex": parseInt
    };

    $.tutorialOverlay = $.tutorialOverlay || {};

    // Copies the HTML data-dialog-* attributes to the settings object
    $.tutorialOverlay.getSettings = function ($el) {
        var settings = {};

        $.each(Object.keys(_props), function (i, key) {
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
