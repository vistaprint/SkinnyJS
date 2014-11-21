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

    describe("#create()", function () {
        it("a click on the background should close the dialog when closeOnBackgroundClick is true", function (done) {
            
            var dialog = $.modalDialog.create({
                content: "#simpleDialog",
                closeOnBackgroundClick: true
            });

            var dialogClosed = false;
            var closeHandler = function () {
                dialogClosed = true;
            };
            dialog.onclose.add(closeHandler);

            dialog
                .open()
                .then(function () {

                    var deferred = $.Deferred();
                    dialog.onclose.one(delayedResolver(deferred));
                    
                    dialog.$bg.trigger("click");
                    
                    return deferred;

                })
                .then(function () {
                    assert.isTrue(dialogClosed);
                })
                .then(done);
        });

        it("a click on the background should not close the dialog when closeOnBackgroundClick is false", function (done) {
            
            var dialog = $.modalDialog.create({
                content: "#simpleDialog",
                closeOnBackgroundClick: false
            });

            var dialogClosed = false;
            var closeHandler = function () {
                dialogClosed = true;
            };
            dialog.onclose.add(closeHandler);

            dialog
                .open()
                .then(wait)
                .then(function () {
                    dialog.$bg.trigger("click");
                })
                .then(wait)
                .then(function () {
                    assert.isFalse(dialogClosed);
                })
                .then(function() {
                    dialog.close();
                    done();
                });
        });
    });

});
