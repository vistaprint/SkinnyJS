
QUnit.config.testTimeout = 1000000;

$(document).ready(function()
{
    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;

    module("jquery.modalDialog.ajax");

    asyncTest("Ensure content node can be shared between two dialogs", 1, function()
    {
        var dialog = $.modalDialog.create({ url: "content/jquery.modalDialog.ajaxContent.fullHtml.html", ajax: true });

        dialog
            .open()
            // .then(function()
            // {
            //     return dialog.close();
            // })
            // .then(function()
            // {
            //     dialog2 = $.modalDialog.create({ content: "#simpleDialog" });
            //     return dialog2.open();
            // })
            // .then(function()
            // {
            //     return dialog2.close();
            // })
            .then(
                function() 
                {
                    ok(true);
                    start();
                },
                function()
                {
                    start();
                });
    });
});

window.onerror = function(msg)
{
    window.console.log("Uncaught error: " + msg);
};