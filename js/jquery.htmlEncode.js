(function ($) {
    var map = {
        "&": "&amp;",
        "'": "&#39;",
        "\"": "&quot;",
        "<": "&lt;",
        ">": "&gt;"
    };

    $.htmlEncode = function (s) {
        return s.replace(/[&"'<>]/g, function (c) {
            return map[c];
        });
    };

})(jQuery);
