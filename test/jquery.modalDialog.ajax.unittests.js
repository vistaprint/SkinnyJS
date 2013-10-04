$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

describe("jquery.modalDialog.ajax", function()
{
    it("Ensure ajax dialog content can be retrieved from a full HTML document", function(done)
    {
        var dialog = $.modalDialog.create({ url: "content/jquery.modalDialog.ajaxContent.fullHtml.html", ajax: true });

        dialog
            .open()
            .then(
                function()
                {
                    expect(dialog.getTitle()).to.be("ModalDialog ajax content, full HTML"); //, "Ensure title is extracted from the content's TITLE tag");

                    expect($.trim(dialog.$container.find(".dialog-content").text())).to.be("Here's some ajax content");

                    return dialog.close();
                })
            .then(done);
    });

    it("Ensure ajax dialog content can be retrieved from a partial HTML document", function(done)
    {
        var dialog = $.modalDialog.create({ url: "content/jquery.modalDialog.ajaxContent.html", ajax: true });

        dialog
            .open()
            .then(
                function()
                {
                    expect($.trim(dialog.$container.find(".dialog-content").text())).to.be("Here's some ajax content");

                    return dialog.close();
                })
            .then(done);
    });

    it("Ensure ajax dialog title is derived from settings if specified", function(done)
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
                    expect(dialog.getTitle()).to.be("Title from settings");

                    return dialog.close();
                })
            .then(done);
    });
});

// window.onerror = function(msg)
// {
//     window.console.log("Uncaught error: " + msg);
// };