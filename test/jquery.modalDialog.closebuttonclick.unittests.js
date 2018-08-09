/// <reference path="jquery.modalDialog.setup.html" />
/// <reference path="jquery.modalDialog.setup.js" />
/// <reference path="../dependencies/jquery.timeout.js" />

$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

describe("jquery.modalDialog", function () {
    this.timeout(6000);

    var assert = chai.assert;

    var delayedResolver = function (deferred) {
        return function (e) {
            setTimeout(function () {
                if (e.isDialogCloseButton == true) {
                    deferred.resolve();
                }
                else {
                    deferred.reject();
                }
            }, 0);
        };
    };

    describe("#create()", function () {
        it("should close the dialog with isDialogCloseButton true when the close button is clicked", function (done) {
            
            var dialog = $.modalDialog.create({
                content: "#simpleDialog"
            });


            dialog
                .open()
                .then(function () {
                    var deferred = $.Deferred();
                    dialog.onclose.one(delayedResolver(deferred));

                    dialog.$el.find(".dialog-close-button").trigger("click");

                    return deferred;
                })
                .then(function () {
                    assert.ok(true);
                    done();
                });
        });

        it("should close the dialog with isDialogCloseButton true when an element with the data-action=close property is clicked", function (done) {

            var dialog = $.modalDialog.create({
                content: '<a data-action="close">link</a>',//jshint ignore:line
                closeOnBackgroundClick: true
            });


            dialog
                .open()
                .then(function () {

                    var deferred = $.Deferred();
                    dialog.onclose.one(delayedResolver(deferred));

                    dialog.$contentContainer.find('*[data-action="close"]').first().trigger("click");//jshint ignore:line

                    return deferred;

                })
                .then(function () {
                    assert.ok(true);
                    done();
                });
        });
    });

});