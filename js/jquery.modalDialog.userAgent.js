(function($) {
    $.modalDialog = $.modalDialog || {};

    var _ua = $.modalDialog._ua = (function() {
        var ua = navigator.userAgent;

        // Internet Explorer 7 specific checks
        if (ua.indexOf("MSIE 7.0") > 0) {
            return {
                ie: true,
                ie7: true,
                version: 7,
                compat: ua.indexOf("compatible") > 0
            };
        }

        // Internet Explorer 8 specific checks
        if (ua.indexOf("MSIE 8.0") > 0) {
            return {
                ie: true,
                ie8: true,
                version: 8,
                compat: ua.indexOf("compatible") > 0
            };
        }

        return {};
    })();

    var _isSmallScreenOverride;

    $.modalDialog.setSmallScreen = function(isSmallScreen) {
        _isSmallScreenOverride = isSmallScreen;
    };

    // Returns true if we're on a small screen device like a smartphone.
    // Dialogs behave slightly different on small screens, by convention.
    $.modalDialog.isSmallScreen = function() {
        if (typeof(_isSmallScreenOverride) != "undefined") {
            return _isSmallScreenOverride;
        }

        // Detect Internet Explorer 7/8, force them to desktop mode
        if (_ua.ie7 || _ua.ie8) {
            return false;
        }

        var width = $(window).width();
        return (typeof window.orientation == "number" ? Math.min(width, $(window).height()) : width) <= 480;
    };

})(jQuery);
