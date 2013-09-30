
QUnit.config.testTimeout = 1000000;

$(document).ready(function()
{
    function cleanup()
    {
        // var dialog = $.modalDialog.getCurrent();
        // if (dialog)
        // {
        //     stop();

        //     dialog
        //         .close()
        //         .then(function()
        //         {
        //             start();
        //         },
        //         function()
        //         {
        //             throw new Error("Error cleaning up");
        //         });
        // }
    }

    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;

    $.modalDialog.enableHistory();

    module(
        "jquery.modalDialog.history",
        {
            setup: cleanup,
            teardown: cleanup
        });

    asyncTest("Ensure opening a node dialog modifies the URL", 8, function()
    {
        var dialog = $.modalDialog.create({ content: "#simpleDialog" });

        dialog
            .open()
            .then(function()
            {
                // The dialog was opened. There should be dialog parameters in the URL.

                var qs = $.currentQueryString();
                equal(qs.dialogType, "node", "The dialog is open: there should be a dialogType in the URL");
                equal(qs.dialogId, "#simpleDialog", "The dialog is open: there should be a dialogId in the URL");

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
                equal(typeof qs.dialogType, "undefined", "The dialog is closed: there should be no dialogType in the URL");
                equal(typeof qs.dialogId, "undefined", "The dialog is closed: there should be no dialogId in the URL");

                // TODO verify dialog is actually closed

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
                equal(qs.dialogType, "node", "The dialog is open: there should be a dialogType in the URL");
                equal(qs.dialogId, "#simpleDialog", "The dialog is open: there should be a dialogId in the URL");

                return dialog.close();
            })
            .then(function()
            {
                // TODO: Investigate why delay is required. Is it because the promise is being resolved before all close handlers are fired?
                return $.timeout(100);
            })
            .then(function()
            {
                // We manually closed the dialog. The parameters should no longer be in the URL.

                var qs = $.currentQueryString();
                equal(typeof qs.dialogType, "undefined", "The dialog is closed: there should be no dialogType in the URL");
                equal(typeof qs.dialogId, "undefined", "The dialog is closed: there should be no dialogId in the URL");

                start();
            });
    });

});

window.onerror = function(msg)
{
    window.console.log("Uncaught error: " + msg);
};