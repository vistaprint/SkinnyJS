/// <reference path="jquery.modalDialog.setup.html" />
/// <reference path="jquery.modalDialog.setup.js" />

/// <reference path="../js/jquery.modalDialog.history.js" />

/// <reference path="../dependencies/jquery.timeout.js" />

/// <reference path="../dependencies/history.adapter.jquery.js" />
/// <reference path="../dependencies/history.html4.js" />
/// <reference path="../dependencies/history.js" />

$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

describe("jQuery.moddalDialog.enableHistory()", function () {
    var assert = chai.assert;

    var DIALOG_PARAM_NAME = "testdialogparam";

    var wait = function () {
        // Calling dialog.close() invokes history.back(), which is asynchronous (in most browsers).
        // We need a timeout to wait until the URL is really updated.

        // TODO it would be great to have a way to tell when the URL was really updated:
        // wrap up an API that would return a promise from history.back()

        return $.timeout(100);
    };

    it("should not close a dialog that has history disabled", function (done) {
        var $content = $("<div id='simpleDialog' class='dialog-content'></div>")
            .appendTo("body");

        var dialog = $.modalDialog.create({
            content: $content,
            enableHistory: false
        });
        dialog
            .open()
            .then(
                function () {
                    return $.modalDialog.enableHistory(DIALOG_PARAM_NAME);
                })
            .then(wait)
            .then(
                function () {
                    assert.ok(dialog.isOpen());

                    return dialog.close();
                })
            .then(
                function () {
                    done();
                });
    });

});
