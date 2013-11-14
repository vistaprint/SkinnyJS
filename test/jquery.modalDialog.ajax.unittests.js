$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

describe("AjaxDialog", function () {
    var assert = chai.assert;

    it("should load content from a full HTML document", function (done) {
        var dialog = $.modalDialog.create({
            url: "content/jquery.modalDialog.ajaxContent.fullHtml.html",
            ajax: true
        });

        dialog
            .open()
            .then(
                function () {
                    assert.equal(dialog.getTitle(), "ModalDialog ajax content, full HTML", "Ensure title is extracted from the content's TITLE tag");

                    assert.equal($.trim(dialog.$container.find(".dialog-content").text()), "Here's some ajax content");

                    return dialog.close();
                })
            .then(done);
    });

    it("should load content from a partial HTML document", function (done) {
        var dialog = $.modalDialog.create({
            url: "content/jquery.modalDialog.ajaxContent.html",
            ajax: true
        });

        dialog
            .open()
            .then(
                function () {
                    assert.equal($.trim(dialog.$container.find(".dialog-content").text()), "Here's some ajax content");

                    return dialog.close();
                })
            .then(done);
    });

    it("should set the dialog title from settings if specified", function (done) {
        var dialog = $.modalDialog.create({
            url: "content/jquery.modalDialog.ajaxContent.fullHtml.html",
            ajax: true,
            title: "Title from settings"
        });

        dialog
            .open()
            .then(
                function () {
                    assert.equal(dialog.getTitle(), "Title from settings");

                    return dialog.close();
                })
            .then(done);
    });
});
