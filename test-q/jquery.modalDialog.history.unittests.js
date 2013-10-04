
QUnit.config.testTimeout = 1000000;

$(document).ready(function()
{
    var DIALOG_PARAM_NAME = "testdialogparam";

    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;
    $.modalDialog.enableHistory(DIALOG_PARAM_NAME);

    module("jquery.modalDialog.history");

    function testDialogHistoryManagement(dialogType, dialogOptions)
    {
        asyncTest("Ensure opening and closing a dialog modifies the URL and history", 8, function()
        {
            var dialog = $.modalDialog.create(dialogOptions);

            dialog
                .open()
                .then(function()
                {
                    equal(dialog.isOpen(), true, "Ensure dialog is closed");

                    // The dialog was opened. There should be dialog parameters in the URL.

                    var qs = $.currentQueryString();
                    equal(typeof qs[DIALOG_PARAM_NAME], "string", "The dialog is open: there should be dialog parameters in the URL");

                    var deferred = $.Deferred();
                    var closeHandler = function()
                    {
                        setTimeout(deferred.resolve, 10);
                        dialog.onclose.remove(closeHandler);
                    };

                    dialog.onclose.add(closeHandler);

                    window.history.back();

                    return deferred;
                })
                .then(function()
                {
                    // We navigated back. There should not be any dialog parameters in the URL.

                    var qs = $.currentQueryString();
                    equal(typeof qs[DIALOG_PARAM_NAME], "undefined", "The dialog is closed: there should not be dialog parameters in the URL");

                    equal(dialog.isOpen(), false, "Ensure dialog is closed");

                    var deferred = $.Deferred();
                    var openHandler = function()
                    {
                        setTimeout(deferred.resolve, 10);
                        dialog.onopen.remove(openHandler);
                    };

                    dialog.onopen.add(openHandler);

                    window.history.forward();

                    return deferred;
                })
                .then(function()
                {
                    // We navigated forward. The dialog parameters should be back in the URL.

                    var qs = $.currentQueryString();
                    equal(typeof qs[DIALOG_PARAM_NAME], "string", "The dialog is open: there should be dialog parameters in the URL");

                    equal(dialog.isOpen(), true, "Ensure dialog is open");

                    return dialog.close();
                })
                .then(function()
                {
                    // Calling dialog.close() invokes history.back(), which is asynchronous (in most browsers).
                    // We need a timeout to wait until the URL is really updated.

                    // TODO it would be great to have a way to tell when the URL was really updated:
                    // wrap up an API that would return a promise from history.back()

                    return $.timeout(100);
                })
                .then(function()
                {
                    equal(dialog.isOpen(), false, "Ensure dialog is closed");

                    // We manually closed the dialog. The parameters should no longer be in the URL.

                    var qs = $.currentQueryString();
                    equal(typeof qs[DIALOG_PARAM_NAME], "undefined", "The dialog is closed: there should not be dialog parameters in the URL");

                    start();
                });
        });
    }

    testDialogHistoryManagement("node", { content: "#simpleDialog" });

    testDialogHistoryManagement("iframe", { url: "content/jquery.modalDialog.iframeContent.html" });

    testDialogHistoryManagement("ajax", { url: "content/jquery.modalDialog.ajaxContent.html", ajax: true });
});

window.onerror = function(msg)
{
    window.console.log("Uncaught error: " + msg);
};