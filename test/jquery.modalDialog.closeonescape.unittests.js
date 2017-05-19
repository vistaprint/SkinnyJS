/// <reference path="jquery.modalDialog.setup.html" />
/// <reference path="jquery.modalDialog.setup.js" />
/// <reference path="../dependencies/jquery.timeout.js" />

$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

describe("jquery.modalDialog", function () {
    this.timeout(6000);

    var assert = chai.assert;

    var delayedResolver = function (deferred) {
        return function () {
            setTimeout(function () {
                deferred.resolve();
            }, 0);
        };
    };

    var wait = function () {
        return $.timeout(100);
    };
    var esc = $.Event("keydown", { keyCode: 27 });
    describe("#create()", function () {
        it("should close the dialog when escape is pressed and closeOnEscape is true", function (done) {
            
            var dialog = $.modalDialog.create({
                content: "#simpleDialog",
                closeOnEscape: true
            });


            dialog
                .open()
                .then(function () {

                    var deferred = $.Deferred();
                    dialog.onclose.one(delayedResolver(deferred));
                    
                    dialog.$bg.trigger(esc);
                    
                    return deferred;

                })
                .then(function () {
                    assert.ok(true);
                    done();
                });
        });

        it("should not close the dialog when escape is pressed and closeOnEscape is false", function (done) {
            
            var dialog = $.modalDialog.create({
                content: "#simpleDialog",
                closeOnEscape: false
            });

            var dialogClosed = false;
            dialog.onclose.add(function () {
                dialogClosed = true;
            });


            dialog
                .open()
                .then(wait)
                .then(function () {
                    dialog.$bg.trigger(esc);
                })
                .then(wait)
                .then(function () {
                    assert.isFalse(dialogClosed);
                })
                .then(function() {
                    return dialog.close();
                })
                .then(function() {
                    done();
                });
        });
    });

});
