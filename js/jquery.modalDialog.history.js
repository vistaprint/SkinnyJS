/* globals History */
// TODO: Need to support stacking dialogs:
// i.e. ?dialogs=#foo,ajax:/foo.html,iframe:/foo.html
// TODO require history.js

(function($) 
{
    var DEFAULT_DIALOG_PARAM_NAME = "sdialogid";
    var _dialogParamName;

    // Enables the history plugin, and returns a promise which
    // resolves when either the dialog specified in the URL is opened,
    // or if there is no dialog specified, immediately
    $.modalDialog.enableHistory = function(dialogParamName)
    {
        _dialogParamName = dialogParamName || DEFAULT_DIALOG_PARAM_NAME;

        var deferred = new $.Deferred();

        updateFromUrl()
            .then(function()
            {
                $.modalDialog.onopen.add(openHandler);
                $.modalDialog.onclose.add(closeHandler);

                History.pushState(null, null, document.location.href);

                History.Adapter.bind(window, "statechange", popstateHandler);

                deferred.resolve();
            });

        return deferred;
    };

    var _pageIsAtInitialState = true;
    var _stateAlreadyProcessed = false;
    var _disableHandlers = false;

    var parseDialogParams = function(data)
    {
        if (!data)
        {
            return null;
        }

        var delimPos = data.indexOf(",");

        if (delimPos < 0)
        {
            return null;
        }

        return {
            dialogType: data.substr(0, delimPos),
            dialogId: data.substr(delimPos + 1)
        };
    };

    var encodeDialogParams = function(dialogType, dialogId)
    {
        return dialogType + "," + dialogId;
    };

    // Handler for dialogs opening
    var openHandler = function()
    {
        // Hook to ensure the history handler doesn't run infinitely
        // when the dialog was opened by the history plugin itself
        if (_disableHandlers)
        {
            return;
        }

        if (this.settings.enableHistory === false)
        {
            return;
        }

        // Build a querystring to encode the open state of the dialog

        var dialogType = "node";

        // Get the ID of the selected element (for node dialogs)
        var dialogId = this.settings.content ? "#" + $(this.settings.content).prop("id") : null;

        // If its not a node dialog, use the URL as the ID
        if (!dialogId && this.settings.url)
        {
            dialogType = this.settings.ajax ? "ajax" : "iframe";
            dialogId = this.settings.url;
        }

        var qs = $.currentQueryString();
        qs[_dialogParamName] = encodeDialogParams(dialogType, dialogId);

        var url = $.appendQueryString(document.location.pathname, qs);

        // Hook to notify the popstate handler that this URL change was triggered internally,
        // and the dialog is already open, so it shouldn't do any more work.
        _stateAlreadyProcessed = true;

        // Update the URL
        History.pushState(null, null, url);

        // Mark the page as not in its initial state so the close handler will know if
        // it should add a history entry when closing dialogs
        _pageIsAtInitialState = false;
    };

    // Handler which fires when dialogs are closed
    var closeHandler = function()
    {
        if (_disableHandlers)
        {
            return;
        }

        if (this.settings.enableHistory === false)
        {
            return;
        }

        // If the page is in its initial state (just loaded), then closing a dialog should
        // create a new history entry so the back button will open the dialog again.
        if (_pageIsAtInitialState)
        {
            var qs = $.currentQueryString();
            delete qs[_dialogParamName];

            var url = $.appendQueryString(document.location.pathname, qs);

            History.pushState(null, null, url);
        }
        else
        {
            // If the page isn't in its initial state, then closing a dialog should go back
            // one entry in history.
            History.back();
        }

        _pageIsAtInitialState = false;
    };

    // Looks for changes in the URL and opens or closes dialogs accordingly
    var popstateHandler = function()
    {
        // If the history plugin triggered the URL change itself,
        // then the UI has been updated already, and we shouldn't update anything.
        if (_stateAlreadyProcessed)
        {
            _stateAlreadyProcessed = false;
            return;
        }

        updateFromUrl();
    };

    var updateFromUrl = function()
    {
        var deferred = new $.Deferred();
        var settings;
        var qs = $.currentQueryString();
        var dialogParams = parseDialogParams(qs[_dialogParamName]);

        // If the URL is for a dialog, prepare to open the dialog
        // Build a dialog settings object
        if (dialogParams)
        {
            if (dialogParams.dialogType == "iframe")
            {
                settings = { url: dialogParams.dialogId };
            }
            else if (dialogParams.dialogType == "ajax")
            {
                settings = 
                { 
                    ajax: true,
                    url: dialogParams.dialogId
                };
            }
            else
            {
                var $content;
                try
                {
                    $content = $(dialogParams.dialogId);
                }
                catch(ex)
                {}

                if ($content.length > 0)
                {
                    settings = $.modalDialog.getSettings($content);
                    settings.content = $content;
                }
            }
        }

        if (settings)
        {
            // Try to reuse an existing, matching dialog if possible
            var dialog = $.modalDialog.getExisting(settings);

            // If it doesn't exist, create a new one
            if (!dialog)
            {
                dialog = $.modalDialog.create(settings);
            }

            _disableHandlers = true;

            dialog.open()
                .then(function()
                {
                    setTimeout(function()
                    {
                        deferred.resolve();
                        _disableHandlers = false;
                    },
                    0);
                });
        }
        else
        {
            var currentDialog = $.modalDialog.getCurrent();
            if (currentDialog)
            {
                _disableHandlers = true;
                currentDialog.close()
                    .then(function()
                    {
                        setTimeout(function() 
                        {
                            deferred.resolve();
                            _disableHandlers = false;
                        }, 
                        0); 
                    });
            }
            else
            {
                deferred.resolve();
            }
        }

        return deferred;
    };

})(jQuery);
