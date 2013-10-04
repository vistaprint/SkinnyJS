
QUnit.config.testTimeout = 1000000;

$(document).ready(function()
{
    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;

    module("jquery.modalDialog.ajax");

    asyncTest("Ensure ajax dialog content can be retrieved from a full HTML document", 2, function()
    {
        var dialog = $.modalDialog.create({ url: "content/jquery.modalDialog.ajaxContent.fullHtml.html", ajax: true });

        dialog
            .open()
            .then(
                function()
                {
                    equal(dialog.getTitle(), "ModalDialog ajax content, full HTML", "Ensure title is extracted from the content's TITLE tag");

                    equal($.trim(dialog.$container.find(".dialog-content").text()), "Here's some ajax content");

                    return dialog.close();
                })
            .then(start);
    });

    asyncTest("Ensure ajax dialog content can be retrieved from a partial HTML document", 1, function()
    {
        var dialog = $.modalDialog.create({ url: "content/jquery.modalDialog.ajaxContent.html", ajax: true });

        dialog
            .open()
            .then(
                function()
                {
                    equal($.trim(dialog.$container.find(".dialog-content").text()), "Here's some ajax content");

                    return dialog.close();
                })
            .then(start);
    });

    asyncTest("Ensure ajax dialog title is derived from settings if specified", 1, function()
    {
        var dialog = $.modalDialog.create({ 
            url: "content/jquery.modalDialog.ajaxContent.fullHtml.html", 
            ajax: true, 
            title: "Title from settings"
        });

        dialog
            .open()
            .then(
                function()
                {
                    equal(dialog.getTitle(), "Title from settings");

                    return dialog.close();
                })
            .then(start);
    });
});

window.onerror = function(msg)
{
    window.console.log("Uncaught error: " + msg);
};