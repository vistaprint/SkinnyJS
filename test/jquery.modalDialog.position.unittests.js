/*jshint quotmark:false */

// Scrollbars are messing up measurements of the window size
$(document.body).css("overflow", "hidden");

$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

describe("jquery.modalDialog.position", function()
{
    var assert = chai.assert;

    it("is centered when opened", function(done)
    {
        var dialog = $.modalDialog.create({ content: "#vegDialog" });

        dialog.open()
            .then(
                function()
                {
                    var rect = dialog.$container.clientRect();

                    var windowRect = {
                        width: $(window).width(),
                        height: $(window).height()
                    };

                    var expectedTop = Math.max((windowRect.height / 2) - (rect.height / 2), 10);

                    if ($.modalDialog.isSmallScreen())
                    {
                        expectedTop = 10;
                    }

                    assert.closeTo(rect.top, expectedTop, 1);

                    var expectedLeft = (windowRect.width / 2) - (rect.width / 2);
                    assert.closeTo(rect.left, expectedLeft, 1);

                    return dialog.close();
                })
            .then(
                function()
                {
                    done();
                });
    });
});
