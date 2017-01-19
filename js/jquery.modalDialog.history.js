/* globals History */
// TODO: Need to support stacking dialogs:
// i.e. ?dialogs=#foo,ajax:/foo.html,iframe:/foo.html
// TODO require history.js

(function ($) {
    var DEFAULT_DIALOG_PARAM_NAME = "sdialogid";
    var _dialogParamName;

    // Enables the history plugin, and returns a promise which
    // resolves when either the dialog specified in the URL is opened,
    // or if there is no dialog specified, immediately
    $.modalDialog.enableHistory = function (dialogParamName) {
        // Ensure enableHistory isn't called twice
        if (_historyEnabled) {
            return;
        }

        _historyEnabled = true;

        _dialogParamName = dialogParamName || DEFAULT_DIALOG_PARAM_NAME;

        // Disable history for any dialogs that are currently open.
        // This is to ensure that we don't initialize with the URL and
        // dialogs in an incompatible state. This probably would happen
        // if someone opened a dialog when the DOM loaded, in which
        // case it was meant to be part of the initial page state.
        disableHistoryForOpenDialogs();

        var deferred = new $.Deferred();

        updateFromUrl(true) // Disable animation when the dialog state is restored from the URL
            .then(
                function () {
                    try {
                        $.modalDialog.onopen.add(openHandler);
                        $.modalDialog.onclose.add(closeHandler);

                        //History.pushState(null, document.title, document.location.href);

                        History.Adapter.bind(window, "statechange", popstateHandler);

                        deferred.resolve();
                    } catch (ex) {
                        deferred.reject(ex);
                    }
                },
                function (ex) {
                    deferred.reject(ex);
                });

        return deferred;
    };

    $.modalDialog.isHistoryEnabled = function () {
        return _historyEnabled;
    };

    // Handle history.js in hash mode for browser that don't support pushState
    var currentQueryStringOrHash = function () {
        if (History.emulated.pushState && window.location.hash) {
            var qPos = window.location.hash.indexOf("?");
            if (qPos >= 0) {
                return $.deparam(window.location.hash.substr(qPos));
            }
        }

        if (window.location.search) {
            return $.currentQueryString();
        }

        return {};
    };

    var disableHistoryForOpenDialogs = function () {
        var parent = $.modalDialog.getCurrent();

        while (parent) {
            if (parent) {
                parent.settings.enableHistory = false;
            }

            parent = parent.getParent();
        }
    };

    // If history is disabled for any dialog in the stack, it should be disabled
    // for all of them.
    var isHistoryEnabled = function (dialog) {

        // History is completely broken in IE8 for IFrame dialogs because the iframes
        // inject entries into history
        if ($.modalDialog._ua.ie && $.modalDialog._ua.version <= 8) {
            if (dialog.settings.url && !dialog.settings.ajax) {
                return false;
            }
        }

        var parent = dialog;

        do {
            if (parent && !parent.settings.enableHistory) {
                return false;
            }

            parent = parent.getParent();

        } while (parent);

        return _historyEnabled;
    };

    var _pageIsAtInitialState = true;
    var _stateAlreadyProcessed = false;
    var _disableHandlers = false;
    var _historyEnabled = false;

    var getDialogParams = function (dialog) {
        var dialogParams = {
            dialogType: "node",
            dialogId: null
        };

        // Get the ID of the selected element (for node dialogs)
        if (dialog.settings.content) {
            var id = $(dialog.settings.content).prop("id");
            if (!id) {
                throw new Error("The specified content node has no ID, and cannot be serialized to a URL parameter.");
            }

            dialogParams.dialogId = "#" + id;
        }

        // If its not a node dialog, use the URL as the ID
        if (!dialogParams.dialogId && dialog.settings.url) {
            dialogParams.dialogType = dialog.settings.ajax ? "ajax" : "iframe";
            dialogParams.dialogId = dialog.settings.url;
        }

        return dialogParams;
    };

    var getDialogSettingsFromParams = function (dialogParams) {
        var settings = null;

        if (dialogParams.dialogType == "iframe") {
            settings = {
                url: dialogParams.dialogId
            };
        } else if (dialogParams.dialogType == "ajax") {
            settings = {
                ajax: true,
                url: dialogParams.dialogId
            };
        } else {
            var $content;
            try {
                $content = $(dialogParams.dialogId);
            } catch (ex) {}

            if ($content && $content.length > 0) {
                settings = $.modalDialog.getSettings($content);
                settings.content = $content;
            }
        }

        return settings;
    };

    var doParamsMatchDialog = function (dialogParams, dialog) {
        var d1 = getDialogParams(dialog);

        return d1.dialogType == dialogParams.dialogType &&
            d1.dialogId == dialogParams.dialogId;
    };

    var encodeDialogId = function (s) {
        return s.replace("#", "-hash-");
    };

    var decodeDialogId = function (s) {
        return s.replace("-hash-", "#");
    };

    var parseDialogParams = function (data) {
        if (!data) {
            return [];
        }

        var items = data.split(" ");

        return $.map(items, function (item) {
            var delimPos = item.indexOf("_");

            if (delimPos < 0) {
                throw new Error("Invalid dialog parameters: " + item);
            }

            return {
                dialogType: item.substr(0, delimPos),
                dialogId: decodeDialogId(item.substr(delimPos + 1))
            };
        });
    };

    var encodeDialogParams = function (dialogParamsList) {
        return $.map(dialogParamsList, function (item) {
            return item.dialogType + "_" + encodeDialogId(item.dialogId);
        })
            .join(" ");
    };

    //Chrome 42+ (and possibly earlier?) sometimes scrolls the window to the top when the dialog is shown
    //  - possibly scrolling the dialog out of view. This occurs every other opening and may be due
    //  to some third-party javascript, but this fix appears to keep the browser from scrolling.  The
    //  situation does not occur if History.pushState is not used.
    var pushStateScrollFix = function () {
        var $window = $(window);
        if ($window.scrollTop() === 0) {    //Ignore the event if it's not scrolled to the very top of the window - it's likely a user-initiated scroll.
            var state = History.getState(true, false);
            // If we don't know where to scroll back to, or the original scrollTop was 0, then noop.
            if (state && state.data && state.data.scrollTop) {
                $(window).scrollTop(state.data.scrollTop);
                return false;
            }
        }
    };

    // Handler for dialogs opening
    var openHandler = function () {
        // Hook to ensure the history handler doesn't run infinitely
        // when the dialog was opened by the history plugin itself
        if (_disableHandlers) {
            return;
        }

        if (!isHistoryEnabled(this)) {
            return;
        }

        // Build a querystring to encode the open state of the dialog

        var dialogParams = getDialogParams(this);

        // If there's an existing open dialog, encode the parameters for this dialog after it
        var qs = currentQueryStringOrHash();
        var dialogParamsList = parseDialogParams(qs[_dialogParamName]);

        // Verify that the level of the dialog matches the number of items in the dialogParamsList
        if ((this.level + 1) <= dialogParamsList.length) {
            throw new Error("The number of dialogParams in the URL doesn't match the number of open dialogs. Not updating history.");
        }

        dialogParamsList.push(dialogParams);
        qs[_dialogParamName] = encodeDialogParams(dialogParamsList);

        var url = $.appendQueryString(document.location.pathname, qs);

        // Hook to notify the popstate handler that this URL change was triggered internally,
        // and the dialog is already open, so it shouldn't do any more work.
        _stateAlreadyProcessed = true;

        var $window = $(window);

        // Update the URL
        History.pushState({scrollTop: $window.scrollTop()}, document.title, url);

        // Mark the page as not in its initial state so the close handler will know if
        // it should add a history entry when closing dialogs
        _pageIsAtInitialState = false;

        // If the window scrolls while the dialog is open, ignore it.  But only ignore it the first time after pushState.
        //  This may be confusing to the user when the first attempt to scroll doesn't work, but there's no good way to differentiate
        //  between a user-initiated scroll and when the browser causes it due to the pushState.
        $window.one("scroll", pushStateScrollFix);
    };

    // Handler which fires when dialogs are closed
    var closeHandler = function () {
        if (_disableHandlers) {
            return;
        }

        if (this.settings.enableHistory === false) {
            return;
        }

        if (!isHistoryEnabled(this)) {
            return;
        }

        // If the page is in its initial state (just loaded), then closing a dialog should
        // create a new history entry so the back button will open the dialog again.
        if (_pageIsAtInitialState) {
            var qs = currentQueryStringOrHash();
            var dialogParamsList = parseDialogParams(qs[_dialogParamName]);
            var poppedParams = dialogParamsList.pop();

            if (!doParamsMatchDialog(poppedParams, this)) {
                throw new Error("Closed dialog does not match URL parameters: " + poppedParams.dialogType + "," + poppedParams.dialogId + ". History not updated.");
            }

            // TODO: verify that the dialog params popped off match the current dialog
            // clean up if not

            if (dialogParamsList.length === 0) {
                delete qs[_dialogParamName];
            } else {
                qs[_dialogParamName] = encodeDialogParams(dialogParamsList);
            }

            var url = $.appendQueryString(document.location.pathname, qs);

            History.pushState(null, document.title, url);
        } else {
            // If the page isn't in its initial state, then closing a dialog should go back
            // one entry in history.

            // Since we're in a dialog close handler, we don't want to re-trigger a dialog close
            // when the popstate event fires. This prevents an infinite loop.
            _stateAlreadyProcessed = true;

            History.back();
        }

        // If a scroll event was not fired while the dialog was open, then remove the listener now.
        $(window).off("scroll", pushStateScrollFix);

        _pageIsAtInitialState = false;
    };

    // Looks for changes in the URL and opens or closes dialogs accordingly
    var popstateHandler = function () {
        // If the history plugin triggered the URL change itself,
        // then the UI has been updated already, and we shouldn't update anything.
        if (_stateAlreadyProcessed) {
            _stateAlreadyProcessed = false;
            return;
        }

        updateFromUrl();
    };

    // Listen to URL changes and open/close dialogs accordingly
    var updateFromUrl = function (disableAnimation) {
        var deferred = new $.Deferred();

        // An array of parsed dialog parameters from the URL
        var dialogParamsList = parseDialogParams(currentQueryStringOrHash()[_dialogParamName]);

        // Figure out the topmost dialog so it can be checked against the number of dialogs specified in the URL
        var topmostDialog = $.modalDialog.getCurrent();
        var topmostStackPos = topmostDialog ? topmostDialog.level + 1 : 0;

        if (dialogParamsList.length === topmostStackPos) {
            deferred.resolve();
        }

        // If there are more dialogParams in the URL than dialogs displayed,
        // open them in order
        var openDialogsUntilUrlMatches = function () {
            if (dialogParamsList.length > topmostStackPos) {
                var dialogParams = dialogParamsList[topmostStackPos];

                var settings = getDialogSettingsFromParams(dialogParams);

                // validate settings are correct
                if (!settings) {
                    _disableHandlers = false;

                    deferred.reject("Unable to create dialog settings from dialogId in URL: " + dialogParams.dialogType + "," + dialogParams.dialogId);
                    return;
                }

                // Try to reuse an existing, matching dialog if possible
                var dialog = $.modalDialog.getExisting(settings);

                // If it doesn't exist, create a new one
                if (!dialog) {
                    dialog = $.modalDialog.create(settings);
                }

                // Disable dialog open/close handlers set by this history plugin,
                // because we're currently reading the URL and updating the dialogs.
                // If the handlers were enabled, we'd get infinite looping.
                _disableHandlers = true;

                dialog.open(disableAnimation) // Disable animation when the dialog state is being restored from the URL on page init
                    .then(function () {
                        // Recurse until all dialogs embedded in the URL are open
                        topmostStackPos++;
                        try {
                            openDialogsUntilUrlMatches();
                        } catch (ex) {
                            deferred.reject(ex);
                        }
                    });
            } else {
                setTimeout(function () {
                        deferred.resolve();
                        _disableHandlers = false;
                    },
                    0);
            }
        };

        if (dialogParamsList.length > topmostStackPos) {
            openDialogsUntilUrlMatches();
        }

        // If there are fewer dialogParams in the URL than in dialogs displayed,
        // close them until they match
        var closeDialogsUntilUrlMatches = function () {
            if (dialogParamsList.length < topmostStackPos) {
                var currentDialog = $.modalDialog.getCurrent();
                if (currentDialog) {
                    if (!currentDialog.settings.enableHistory) {
                        deferred.resolve();
                        _disableHandlers = false;
                        return;
                    }

                    // Disable dialog open/close handlers set by this history plugin,
                    // because we're currently reading the URL and updating the dialogs.
                    // If the handlers were enabled, we'd get infinite looping.
                    _disableHandlers = true;

                    currentDialog.close()
                        .then(function () {
                            topmostStackPos--;

                            try {
                                // Recurse until all dialogs not in the URL are closed 
                                closeDialogsUntilUrlMatches();
                            } catch (ex) {
                                deferred.reject(ex);
                            }
                        });
                } else {
                    _disableHandlers = false;
                    deferred.reject("There was a mismatch between the URL and the current open dialog stack");
                }
            } else {
                setTimeout(function () {
                    deferred.resolve();
                    _disableHandlers = false;
                });
            }
        };

        // Close open dialogs that don't match the URL
        if (dialogParamsList.length < topmostStackPos) {
            closeDialogsUntilUrlMatches();
        }

        return deferred;
    };

    /* test-code */
    $.modalDialog._historyPrivate = {
        disableHistoryForOpenDialogs: disableHistoryForOpenDialogs
    };
    /* end-test-code */

})(jQuery);
