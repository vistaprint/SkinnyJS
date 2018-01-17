/// <reference path="jquery.modalDialog.setup.html" />
/// <reference path="jquery.modalDialog.setup.js" />

/// <reference path="../dependencies/jquery.timeout.js" />

$.modalDialog.animationDuration = 100;

describe("jquery.modalDialog.create", function () {

    this.timeout(6000);

    var assert = chai.assert;

    var wait = function () {
        return $.timeout(100);
    };

    it("should prioritize an explicit title over an iframe title tag", function (done) {

        var dialog = $.modalDialog.create({
            url: "/test/content/jquery.modalDialog.iframeContent.html",
            title: "explicit title"
        });

        dialog
            .open()
            .then(wait)
            .then(function () {
                var title = $.trim($(".dialog-header .dialog-header-text").text());

                assert.equal(title, "explicit title");

                return dialog.close();
            })
            .then(wait)
            .then(function () {
                dialog._destroy();
            })
            .then(done);
    });

    it("should use the iframe document's title if options.title is not specified", function (done) {

        var dialog = $.modalDialog.create({
            url: "/test/content/jquery.modalDialog.iframeContent.html"
        });

        dialog
            .open()
            .then(wait)
            .then(function () {
                var title = $.trim($(".dialog-header .dialog-header-text").text());

                assert.equal(title, "ModalDialog iframe content");

                return dialog.close();
            })
            .then(wait)
            .then(function () {
                dialog._destroy();
            })
            .then(done);
    });
});
