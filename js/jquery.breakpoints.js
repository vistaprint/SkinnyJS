/// <reference path="breakpoints.js" />
/* globals skinny */

(function ($) {

    var setupEvents = function (el, breakpoints) {
        var update = function () {
            skinny.breakpoints.update(el, breakpoints);
        };

        $(document).ready(update);
        $(window).on("resize orientationchange breakpoints:refresh", update);
    };

    $.each(skinny.breakpoints.all, function (i, item) {
        setupEvents(item.el, item.breakpoints);
    });

    $.fn.breakpoints = function (breakpoints) {
        this.each(function (i, el) {
            skinny.breakpoints.setup(el, breakpoints);
            setupEvents(el, breakpoints);
        });

        return this;
    };

})(jQuery);
