/// <reference path="breakpoints.js" />
/* globals skinny */

(function ($) {

    var EVENTS_KEY = "breakpoints-events";

    var setupEvents = function (el, breakpoints) {
        var $el = $(el);

        // Ensure events aren't set more than once for the same element
        if ($el.data(EVENTS_KEY)) {
            return;
        }

        $el.data(EVENTS_KEY, true);

        var update = function () {
            skinny.breakpoints.update(el, breakpoints);
        };

        $(document).ready(update);
        $(window).on("resize orientationchange breakpoints:refresh", update);
    };

    // Public API for initializing breakpoints for elements after the page loads
    $.fn.breakpoints = function (breakpoints) {
        this.each(function (i, el) {
            skinny.breakpoints.setup(el, breakpoints);
            setupEvents(el, breakpoints);
        });

        return this;
    };

    $(document).ready(function () {

        // Setup events for any elements that were initialized inline by skinny.breakpoints.setup()
        $.each(skinny.breakpoints.all, function (i, item) {
            setupEvents(item.el, item.breakpoints);
        });

        // Process elements set up for breakpoints unobtrusively
        $("[data-breakpoints]").breakpoints();
    });

})(jQuery);
