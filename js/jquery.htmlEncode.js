// ## jQuery.htmlEncode

// Dead simple HTML encoding.

// ### Usage

//     var encoded = $.htmlEncode('<a href="somelink.html">some link</a>');
//     encoded == "&lt;a href=&quot;somelink.html&quot;&rt;some link&lt;/a&rt;"; // true

// ### Source

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
        return s.replace(/[&"'<>]/g, function(c) {
            return map[c];
        });
    };

})(jQuery);