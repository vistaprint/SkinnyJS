/*
Uses declarative syntax to show a tutorial overlay on page ready.
*/
(function ($) {
    $(window).load(function () {
        var $overlay = $("[data-overlay-autoload]");

        //If more than one autoload overlay is specified, we'll use the first one we find.
        $overlay.each(function () {
            $(this).tutorialOverlay();
            return false; //Don't look for more overlay nodes from the list of overlayIds.
        });
    });
})(jQuery);