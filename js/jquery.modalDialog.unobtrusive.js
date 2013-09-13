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
    >link</a>

For node dialogs, these same properties can also be put on the dialog node as well.

TODO: Move some of the declarative settings into the core, because it is useful regardless of making
the trigger tag unobtrusive

TODO Make the dialog veil hide earlier when closing dialogs. It takes too long.
*/

(function($) 
{
    var DIALOG_DATA_KEY = "modalDialogUnobtrusive";

    // Click handler for all links which open dialogs
    var dialogLinkHandler = function(e)
    {
        e.preventDefault();
        
        var $link = $(e.target);

        var dialog = $link.data(DIALOG_DATA_KEY);

        if (!dialog)
        {
            var href = $link.attr("href");

            if (!href)
            {
                throw new Error("no href specified with data-rel='modalDialog'");
            }

            // Create a dialog settings object
            var settings = 
            {
                contentOrUrl: href
            };

            // Duplicate values on the link will win over values on the dialog node
            var linkSettings = $.modalDialog.getSettings($link);
            $.extend(settings, linkSettings);

            // Give unobtrusive scripts a chance to modify the settings
            var evt = new $.Event("dialogsettingscreate");
            evt.dialogSettings = settings;

            $link.trigger(evt);

            if (evt.isDefaultPrevented())
            {
                return;
            }

            dialog = $.modalDialog.create(settings);
            
            // Give unobtrusive scripts a chance to modify the dialog
            evt = new $.Event("dialogcreate");
            evt.dialogSettings = settings;
            evt.dialog = dialog;

            $link.trigger(evt);

            if (evt.isDefaultPrevented())
            {
                return;
            }

            // Cache the dialog object so it won't be initialized again
            $link.data(DIALOG_DATA_KEY, dialog);
        }

        dialog.open();
    };

    // Assign handlers to all dialog links
    $(document).on("click", "[data-rel='modalDialog']", dialogLinkHandler);

    // Helpful utility: A
    $(document).on("click", ".close-dialog", function(e)
    {
        e.preventDefault();
        $.modalDialog.getCurrent().close();
    });

})(jQuery);


