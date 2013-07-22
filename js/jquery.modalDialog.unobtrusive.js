/*jsl:option explicit*/
/// <reference path="jquery.modalDialog.js" />
/* jshint evil: true */
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
    var ATTR_PREFIX = "data-dialog-";

    var parseNone = function(s)
    {
        return s || null;
    };

    var parseBool = function(s)
    {
        if (s)
        {
            s = s.toString().toLowerCase();
            switch (s)
            {
                case "true":
                case "yes":
                case "1":
                    return true;
                default:
                    break;
            }
        }

        return false;
    };

    var parseFunction = function(body)
    {
        if (!body) 
        {
            return null;
        }

        return new Function("event", body);
    };

    // The properties to copy from HTML data-dialog-* attributes
    // to the dialog settings object
    var _props = [
        ["title", parseNone],         
        ["onopen", parseFunction],
        ["onbeforeopen", parseFunction],         
        ["onclose", parseFunction],        
        ["onbeforeclose", parseFunction],        
        ["maxWidth", parseInt],   
        ["initialHeight", parseInt],    
        ["ajax", parseBool],  
        ["onajaxerror", parseFunction],
        ["destroyOnClose", parseBool],     
        ["skin", parseNone]   
    ];

    // Copies the HTML data-dialog-* attributes to the settings object
    var applyAttributesToSettings = function($el, settings)
    {
        for (var i=0; i<_props.length; i++)
        {
            var name = _props[i][0];
            var parser = _props[i][1];

            // $.fn.attr is case insensitive
            var value = $el.attr(ATTR_PREFIX + name);
            value = parser(value);
            if (value)
            {
                settings[name] = value;
            }
        }
    };

    var DIALOG_DATA_KEY = "modalDialogUnobtrusive";

    // Click handler for all links which open dialogs
    var dialogLinkHandler = function(e)
    {
        var $link = $(e.target);

        var dialog = $link.data(DIALOG_DATA_KEY);

        if (!dialog)
        {
            var href = $link.attr("href");

            if (!href)
            {
                throw new Error("no href specified with data-rel='modalDialog'");
            }

            e.preventDefault();
        
            // Create a dialog settings object
            var settings = {};

            // Check to see if the href is a node or a url
            var $hrefTarget;
            try
            {
                $hrefTarget = $(href);
            }
            catch (ex)
            {
            }

            if ($hrefTarget && $hrefTarget.length > 0) // its a content node
            {
                settings.content = $hrefTarget;

                applyAttributesToSettings($hrefTarget, settings);
            }
            else // its the url for an iframe dialog
            {
                settings.url = href;
            }

            // Duplicate values on the link will win over values on the dialog node
            applyAttributesToSettings($link, settings);

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
    $(document).ready(function()
    {
        $("[data-rel='modalDialog']").on("click", dialogLinkHandler);
    });

})(jQuery);


