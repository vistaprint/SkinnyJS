mocha.setup("bdd");

var MockTip = function () {
    this.getTipEl = function () {
        return $("empty jquery object");
    };

    this.getTipBounds = function () {
        return {
            width: 0,
            height: 0
        };
    };

    this.render = function () {
        //noop
    };
};
var origOverlayTipFactory = $.fn.tutorialOverlayTip;
$.fn.tutorialOverlayTip = function () {
    return new MockTip();
};
$(window).on("load", function () {
    describe("jquery.tutorialOverlay", function () {
        var assert = chai.assert;

        // var manualLoadOverlayId = "#manual-load-overlay";


        //Clean up the DOM
        after(function () {
            $("#test-div").hide();
            $.fn.tutorialOverlayTip = origOverlayTipFactory;
        });

        // var getOverlaySettings = function () {
        //     var settings = $.extend({}, $.tutorialOverlay.defaults);
        //     settings.overlay = manualLoadOverlayId;
        //     settings.hideOnClick = false; //prevent lingering event listener reference
        //     return settings;
        // };

        it("should automatically open a Tutorial Overlay on page load", function () {
            var $overlay = $(".tutorial-overlay[data-overlay-autoload][data-overlay-autoload!='false']");
            var overlay = $overlay.tutorialOverlayInstance();
            assert.lengthOf($overlay, 1);
            assert.isDefined(overlay);
            assert(overlay.isShowing(), "The auto-load overlay is showing.");

            overlay.hide();
        });
    });
    mocha.checkLeaks();
    mocha.globals(["jQuery"]);
    //Don't run mocha tests until *after* page load to give the auto-loading Tutorial Overlay a chance to load.
    setTimeout(mocha.run, 50);
});