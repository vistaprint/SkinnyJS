$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

describe("jquery.modalDialog.history", function()
{
    var assert = chai.assert;
    
    var DIALOG_PARAM_NAME = "testdialogparam";

    $.modalDialog.enableHistory(DIALOG_PARAM_NAME);

    function testDialogHistoryManagement(dialogType, dialogOptions)
    {
        it("Ensure opening and closing a dialog modifies the URL and history", function(done)
        {
            var dialog = $.modalDialog.create(dialogOptions);

            dialog
                .open()
                .then(function()
                {
                    assert.isTrue(dialog.isOpen(), "Ensure dialog is closed");

                    // The dialog was opened. There should be dialog parameters in the URL.

                    var qs = $.currentQueryString();
                    assert.isString(qs[DIALOG_PARAM_NAME], "The dialog is open: there should be dialog parameters in the URL");

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
                    assert.isUndefined(qs[DIALOG_PARAM_NAME], "The dialog is closed: there should not be dialog parameters in the URL");

                    assert.isFalse(dialog.isOpen(), "Ensure dialog is closed");

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
                    assert.isString(qs[DIALOG_PARAM_NAME], "The dialog is open: there should be dialog parameters in the URL");

                    assert.isTrue(dialog.isOpen(), "Ensure dialog is open");

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
                    assert.isFalse(dialog.isOpen(), "Ensure dialog is closed");

                    // We manually closed the dialog. The parameters should no longer be in the URL.

                    var qs = $.currentQueryString();
                    assert.isUndefined(qs[DIALOG_PARAM_NAME], "The dialog is closed: there should not be dialog parameters in the URL");

                    done();
                });
        });

        it("Ensure opening and closing a dialog with settings.enableHistory === false doesn't cause URL changes", function(done)
        {
            var options = $.extend({ enableHistory: false }, dialogOptions);

            var dialog = $.modalDialog.create(options);

            dialog
                .open()
                .then(function()
                {
                    assert.isTrue(dialog.isOpen(), "Ensure dialog is closed");

                    var qs = $.currentQueryString();
                    assert.isUndefined(qs[DIALOG_PARAM_NAME], "The dialog is open: there should be dialog parameters in the URL");

                    return dialog.close();
                })
                .then(function()
                {
                    assert.isFalse(dialog.isOpen(), "Ensure dialog is closed");

                    var qs = $.currentQueryString();
                    assert.isUndefined(qs[DIALOG_PARAM_NAME], "The dialog is closed: there should not be dialog parameters in the URL");

                    done();
                });
        });
    }

    testDialogHistoryManagement("node", { content: "#simpleDialog" });

    testDialogHistoryManagement("iframe", { url: "content/jquery.modalDialog.iframeContent.html" });

    testDialogHistoryManagement("ajax", { url: "content/jquery.modalDialog.ajaxContent.html", ajax: true });
});
