(function($)
{
    $.modalDialog = $.modalDialog || {};

    var _ua = $.modalDialog._ua = (function() 
    {
        var ua = navigator.userAgent;
        
        // Internet Explorer 7 specific checks
        if (ua.indexOf('MSIE 7.0') > 0) 
        {
            return {ie: true, ie7: true, version: 7, compat: ua.indexOf('compatible') > 0};
        }

        // Internet Explorer 8 specific checks
        if (ua.indexOf('MSIE 8.0') > 0) 
        {
            return {ie: true, ie8: true, version: 8, compat: ua.indexOf('compatible') > 0};
        }

        return {};
    })();

    // Returns true if we're on a small screen device like a smartphone.
    // Dialogs behave slightly different on small screens, by convention.
    _ua.isSmallScreen = function()
    {
        // Detect Internet Explorer 7/8, force them to desktop mode
        if (_ua.ie7 || _ua.ie8) {
            return false;
        }

        var w = $(window);
        return (typeof window.orientation == "number" ? Math.min(w.width(), w.height()) : w.width()) <= 480;
    };

})(jQuery);