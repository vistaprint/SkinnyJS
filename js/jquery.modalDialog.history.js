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
        // Ensure enableHistory isn't called twice
        if (_historyEnabled)
        {
            return;
        }

        _historyEnabled = true;

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
    var _historyEnabled = false;

    var getDialogParams = function(dialog)
    {
        var dialogParams = 
        {
            dialogType: "node",

            // Get the ID of the selected element (for node dialogs)
            dialogId: dialog.settings.content ? "#" + $(dialog.settings.content).prop("id") : null
        };

        // If its not a node dialog, use the URL as the ID
        if (!dialogParams.dialogId && dialog.settings.url)
        {
            dialogParams.dialogType = dialog.settings.ajax ? "ajax" : "iframe";
            dialogParams.dialogId = dialog.settings.url;
        }

        return dialogParams;
    };

    // var doParamsMatchDialog = function(dialog, dialogParams)
    // {
    //     var d1 = getDialogParams(dialog);

    //     return d1.dialogType == dialogParams.dialogType &&
    //         d1.dialogId == dialogParams.dialogId;
    // };

    var parseDialogParams = function(data)
    {
        if (!data)
        {
            return [];
        }

        var items = data.split(" ");

        return $.map(items, function(item)
        {
            var delimPos = item.indexOf(",");

            if (delimPos < 0)
            {
                // TODO throw?
                return null;
            }

            return {
                dialogType: item.substr(0, delimPos),
                dialogId: item.substr(delimPos + 1)
            };
        });
    };

    var encodeDialogParams = function(dialogParamsList)
    {
        return $.map(dialogParamsList, function(item)
            {
                return item.dialogType + "," + item.dialogId;
            })
            .join(" ");
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

        var dialogParams = getDialogParams(this);

        // If there's an existing open dialog, encode the parameters for this dialog after it
        var qs = $.currentQueryString();
        var dialogParamsList = parseDialogParams(qs[_dialogParamName]);

        // TODO: verify that the level of the dialog matches the number of items in the dialogParamsList
        // clean up if not

        dialogParamsList.push(dialogParams);
        qs[_dialogParamName] = encodeDialogParams(dialogParamsList);

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
            var dialogParamsList = parseDialogParams(qs[_dialogParamName]);
            dialogParamsList.pop();

            // TODO: verify that the dialog params popped off match the current dialog
            // clean up if not

            if (dialogParamsList.length === 0)
            {
                delete qs[_dialogParamName];
            }
            else
            {
                qs[_dialogParamName] = encodeDialogParams(dialogParamsList);
            }

            var url = $.appendQueryString(document.location.pathname, qs);

            History.pushState(null, null, url);
        }
        else
        {
            // If the page isn't in its initial state, then closing a dialog should go back
            // one entry in history.
            _stateAlreadyProcessed = true;
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
        var dialogParamsList = parseDialogParams(qs[_dialogParamName]);
        var topmostDialog = $.modalDialog.getCurrent();
        var topmostDialogLevel = topmostDialog ? topmostDialog.level + 1 : 0;

        if (dialogParamsList.length === topmostDialogLevel)
        {
            deferred.resolve();
        }

        // If there are more dialogParams in the URL than dialogs displayed,
        // open them in order
        var openDialogsUntilUrlMatches = function()
        {
            if (dialogParamsList.length > topmostDialogLevel)
            {
                var dialogParams = dialogParamsList[topmostDialogLevel-1];

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

                // TODO validate settings are correct
                // Try/catch?

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
                        topmostDialogLevel++;
                        openDialogsUntilUrlMatches();
                    });
            }
            else
            {
                setTimeout(function()
                    {
                        deferred.resolve();
                        _disableHandlers = false;
                    },
                    0);
            }
        };

        if (dialogParamsList.length > topmostDialogLevel)
        {
            openDialogsUntilUrlMatches();
        }

        // If there are fewer dialogParams in the URL than in dialogs displayed,
        // close them until they match
        var closeDialogsUntilUrlMatches = function()
        {
            if (dialogParamsList.length < topmostDialogLevel)
            {
                var currentDialog = $.modalDialog.getCurrent();
                if (currentDialog)
                {
                    _disableHandlers = true;
                    currentDialog.close()
                        .then(function()
                        {
                            topmostDialogLevel--;
                            closeDialogsUntilUrlMatches();
                        });
                }
                else
                {
                    deferred.resolve();
                }
            }
            else
            {
                setTimeout(function()
                {
                    deferred.resolve();
                    _disableHandlers = false;
                });
            }
        };

        if (dialogParamsList.length < topmostDialogLevel)
        {
            closeDialogsUntilUrlMatches();
        }

        return deferred;
    };

})(jQuery);
