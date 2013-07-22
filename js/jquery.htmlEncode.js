/*jsl:option explicit*/
/// <reference path="../jquery-current.js" />

(function($)
{
    var map = {
        "&": "&amp;",
        "'": "&#39;",
        '"': "&quot;",
        "<": "&lt;",
        ">": "&gt;"
    };

    $.htmlEncode = function(s)
    {
        return s.replace(/[&"'\<\>]/g, function(c) {
            return map[c];
        });
    };

})(jQuery);