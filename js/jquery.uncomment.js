 // ## jQuery.uncomment

(function($) {
    $.fn.uncomment = function() {
        for (var i = 0, l = this.length; i < l; i++) {
            for (var j = 0, len = this[i].childNodes.length; j < len; j++) {
                if (this[i].childNodes[j].nodeType === 8) {
                    var content = this[i].childNodes[j].nodeValue;
                    $(this[i].childNodes[j]).replaceWith(content);
                }
            }
        }
    };
})(jQuery);
