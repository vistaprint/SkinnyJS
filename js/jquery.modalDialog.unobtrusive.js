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
    data-dialog-closeonbackgroundclick="{true or false}"
    data-dialog-closeonescape="{true or false}"
    data-dialog-zIndex="{default zIndex}"
    >link</a>

For node dialogs, these same properties can also be put on the dialog node as well.

TODO: Move some of the declarative settings into the core, because it is useful regardless of making
the trigger tag unobtrusive

TODO Make the dialog veil hide earlier when closing dialogs. It takes too long.
*/

(function ($) {
    var DIALOG_DATA_KEY = "modalDialogUnobtrusive";

    // Click handler for all links which open dialogs
    var dialogLinkHandler = function (e) {
        e.preventDefault();

        var $link = $(e.currentTarget);

        var href = $link.attr("data-dialog-url") || $link.attr("href");

        if (!href) {
            throw new Error("no href specified with data-rel='modalDialog'");
        }

        // Create a dialog settings object
        var settings = {
            contentOrUrl: href
        };

        // Duplicate values on the link will win over values on the dialog node
        var linkSettings = $.modalDialog.getSettings($link);
        $.extend(settings, linkSettings);

        // Give unobtrusive scripts a chance to modify the settings
        var evt = new $.Event("dialogsettingscreate");
        evt.dialogSettings = settings;

        $link.trigger(evt);

        if (evt.isDefaultPrevented()) {
            return;
        }

        var dialog = $link.data(DIALOG_DATA_KEY);

        // If the dialog has been previously opened, ensure that the settings haven't changed.
        // If so, discard the cached dialog and create a new one.
        if (dialog) {
            var processedSettings = $.modalDialog._ensureSettings(settings);

            if (!$.modalDialog._areSettingsEqual(dialog.settings, processedSettings)) {
                dialog._destroy();
                dialog = null;
            }
        }

        if (!dialog) {
            dialog = $.modalDialog.create(settings);

            // Give unobtrusive scripts a chance to modify the dialog
            evt = new $.Event("dialogcreate");
            evt.dialogSettings = settings;
            evt.dialog = dialog;

            $link.trigger(evt);

            if (evt.isDefaultPrevented()) {
                return;
            }

            // Unless destroyOnClose is specified,
            // cache the dialog object so it won't be initialized again
            if (!settings.destroyOnClose) {
                $link.data(DIALOG_DATA_KEY, dialog);
            }
        }

        dialog.open();
    };

    // Assign handlers to all dialog links
    $(document).on("click", "[data-rel='modalDialog']", dialogLinkHandler);

    // Helpful utility: A class that will make a button close dialogs by default
    $(document).on("click", ".close-dialog", function (e) {
        e.preventDefault();

        // Defer to the next tick of the event loop. It makes it more useful
        // to apply this class without having to worry if the close handler will
        // run before any other handlers.
        setTimeout(function () {
            var dialog = $.modalDialog.getCurrent();
            if (dialog) {
                dialog.close();
            }
        }, 0);
    });

})(jQuery);
