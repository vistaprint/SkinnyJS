/// <reference path="jquery.modalDialog.setup.html" />
/// <reference path="jquery.modalDialog.setup.js" />

$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

describe("jquery.modalDialog", function () {
    this.timeout(6000);

    var assert = chai.assert;

    describe("#create()", function () {
        it("should allow bubbling when preventEventBubbling is false", function (done) {
            
            var bodyClicked = false;
            $("body").on("click", function () {
                bodyClicked = true;
            });

            var dialog = $.modalDialog.create({
                content: "#simpleDialog",
                preventEventBubbling: false
            });

            dialog
                .open()
                .then(function () {

                    dialog.$bg.trigger("click");
                    assert.isTrue(bodyClicked);

                    // Reset and try again on the container
                    bodyClicked = false;

                    dialog.$container.trigger("click");
                    assert.isTrue(bodyClicked);

                    return dialog.close();
                })
                .then(function () {
                    assert.ok(true);
                    done();
                });
        });

        it("should prevent bubbling when preventEventBubbling is true", function (done) {
            
            var bodyClicked = false;
            $("body").on("click", function () {
                bodyClicked = true;
            });

            var dialog = $.modalDialog.create({
                content: "#simpleDialog",
                preventEventBubbling: true
            });

            dialog
                .open()
                .then(function () {

                    dialog.$bg.trigger("click");
                    assert.isFalse(bodyClicked);

                    // try again on the container
                    dialog.$container.trigger("click");
                    assert.isFalse(bodyClicked);

                    return dialog.close();
                })
                .then(function () {
                    assert.ok(true);
                    done();
                });
        });
    });

});
