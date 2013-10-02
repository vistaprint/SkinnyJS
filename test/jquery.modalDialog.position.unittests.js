/*jshint quotmark:false */

QUnit.config.testTimeout = 1000000;

$(document).ready(function()
{

    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;

    module("jquery.modalDialog.position");

    function isWithinTolerance(actual, expected, tolerance, message)
    {
        if (actual > expected + tolerance ||
            actual < expected - tolerance)
        {
            ok(false, message);
        }
        else
        {
            ok(true, message);
        }
    }

    asyncTest("Ensure dialog is centered", 2, function()
    {
        var dialog = $.modalDialog.create({ content: "#vegDialog" });

        dialog.open()
            .then(
                function()
                {
                    var rect = dialog.$container.clientRect();

                    var windowRect = {
                        width: $(window).width(),
                        height: $(window).height()
                    };

                    var expectedTop = (windowRect.height / 2) - (rect.height / 2);
                    isWithinTolerance(rect.top, expectedTop, 1);

                    var expectedLeft = (windowRect.width / 2) - (rect.width / 2);
                    isWithinTolerance(rect.left, expectedLeft, 1);

                    //return dialog.close();
                })
            .then(
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