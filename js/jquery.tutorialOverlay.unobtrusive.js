/*
Uses declarative syntax to define a dialog. Syntax:

<a 
    href="{selector or url"
    data-rel="modalDialog"
    data-dialog-title="{title}"
    data-dialog-onopen="{onopen handler}"
    data-dialog-onbeforeopen="{onbeforeopen handler}"
    data-dialog-onclose="{onclose handler}"
    data-dialog-onnbeforeclose="{onbeforeclose handler}"
    data-dialog-maxWidth="{maxWidth}"
    data-dialog-skin="{skin}"
    data-dialog-ajax="{true or false}"
    data-dialog-destroyonclose="{true or false}"
    data-dialog-zIndex="{default zIndex}"
    >link</a>

For node dialogs, these same properties can also be put on the dialog node as well.

TODO: Move some of the declarative settings into the core, because it is useful regardless of making
the trigger tag unobtrusive

TODO Make the dialog veil hide earlier when closing dialogs. It takes too long.
*/

(function ($) {
    var OVERLAY_DATA_KEY = "tutorialOverlayUnobtrusive";

    $(document).ready(function () {
        var $overlay = $("[data-overlay-showonpageload]").first();

        if ($overlay.length) {
            var settings = $.tutorialOverlay.getSettings($overlay);

            if (settings.overlayId && (settings.overlayId !== $overlay.attr("id"))) {
                //The element specified a different element as the actual overlay node.
                var $overlayNode = $("#" + settings.overlayId);
                var nodeSettings = $.tutorialOverlay.getSettings($overlayNode);

                // Duplicate values on the element will win over values on the overlay node
                settings = $.extend(nodeSettings, settings);
            } else {
                // Use this element as the overlay if no other ID was specified.
                settings.overlayId = $overlay.attr("id");
            }

            var tutorialOverlay = $.tutorialOverlay.create(settings);

            tutorialOverlay.show();
        }
    });

    //TODO: This is for testing.  I don't see a need for this in the final API.
    var overlayLinkHandler = function (e) {
        e.preventDefault();

        var $link = $(e.currentTarget);

        var dialog = $link.data(OVERLAY_DATA_KEY);

        if (!dialog) {
            var href = $link.attr("href");

            if (!href) {
                throw new Error("no href specified with data-rel='tutorialOverlay'");
            }

            // Create a dialog settings object
            var settings = {
                contentOrUrl: href
            };

            // Duplicate values on the link will win over values on the dialog node
            var linkSettings = $.tutorialOverlay.getSettings($link);
            $.extend(settings, linkSettings);

            dialog = $.tutorialOverlay.create(settings);
            
            // Cache the dialog object so it won't be initialized again
            $link.data(OVERLAY_DATA_KEY, dialog);
        }

        dialog.show();
    };

    // Assign handlers to all overlay links
    $(document).on("click", "[data-rel='tutorialOverlay']", overlayLinkHandler);
})(jQuery);
