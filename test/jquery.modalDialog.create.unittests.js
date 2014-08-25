/// <reference path="jquery.modalDialog.setup.html" />
/// <reference path="jquery.modalDialog.setup.js" />

/// <reference path="../dependencies/jquery.timeout.js" />

$.modalDialog.animationDuration = 100;

describe("jquery.modalDialog.create", function () {

    var assert = chai.assert;

    var wait = function () {
        return $.timeout(100);
    };

    it("should resolve content to a jQuery object from an ID", function (done) {

        var dialog = $.modalDialog.create({
            content: "#simpleDialog"
        });

        assert.ok(dialog.settings.content.jquery, "settings.content should be converted to a jQuery object early");

        dialog
            .open()
            .then(wait)
            .then(function () {

                assert.equal(1, dialog.$content.length);

                return dialog.close();
            })
            .then(wait)
            .then(done);
    });

    it("should throw an exception if the content isn't found", function () {

        assert.throws(function () {
            $.modalDialog.create({
                content: "#iDontExist"
            });
        });
    });
});
