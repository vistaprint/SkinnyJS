/* globals History */

QUnit.config.testTimeout = 1000000;

$(document).ready(function()
{
    var DIALOG_PARAM_NAME = "testdialogparam";

    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;

    module("jquery.modalDialog.history.init");

    asyncTest("Ensure that a dialog specified in the current URL is enabled when $.modalDialog.enableHistory() is called", 2, function()
    {
        var qs = "?" + DIALOG_PARAM_NAME + "=" + encodeURIComponent("node,#simpleDialog");

        if (document.location.search != qs)
        {
           History.pushState(null, null, document.location.pathname + qs); 
        }

        var dialog;

        $.modalDialog.enableHistory(DIALOG_PARAM_NAME)
            .then(function()
            {
                var qs = $.currentQueryString();
                equal(typeof qs[DIALOG_PARAM_NAME], "string", "The dialog is open: there should be dialog parameters in the URL");

                dialog = $.modalDialog.getCurrent();
                ok(dialog, "A current dialog should be returned");
            })
            .then(function()
            {
                return dialog.close();
            })
            .then(function()
            {
                start();
            });
    });

});

window.onerror = function(msg)
{
    window.console.log("Uncaught error: " + msg);
};