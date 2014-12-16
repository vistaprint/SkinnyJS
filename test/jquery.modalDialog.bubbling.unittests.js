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

                    // try on the dialog
                    dialog.$container.trigger("click");
                    assert.isTrue(bodyClicked);

                    // reset and try again on the background veil
                    bodyClicked = false;

                    dialog.onclose.add(function () {
                        assert.ok(true);
                        done();
                    });

                    dialog.$bg.trigger("click");
                    assert.isTrue(bodyClicked);

                    return;
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

                    // try on the dialog
                    dialog.$container.trigger("click");
                    assert.isFalse(bodyClicked);

                    // try again on the background veil
                    dialog.onclose.add(function () {
                        assert.ok(true);
                        done();
                    });

                    dialog.$bg.trigger("click");
                    assert.isFalse(bodyClicked);

                    return;
                });
        });
    });

});
