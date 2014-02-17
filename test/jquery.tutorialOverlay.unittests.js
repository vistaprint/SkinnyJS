describe("jquery.tutorialOverlay", function () {
    var assert = chai.assert;

    var instanceDataAttr = "tutorialOverlay";
    var manualLoadOverlayId = "#manual-load-overlay";

    var origOverlayTipFactory;
    before(function () {
        origOverlayTipFactory = $.fn.tutorialOverlayTip;
        $.fn.tutorialOverlayTip = function () {
            return new MockTip();
        };
    });

    //Clean up the DOM
    after(function () {
        $("#test-div").hide();
        $.fn.tutorialOverlayTip = origOverlayTipFactory;
    });

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

    var getOverlaySettings = function () {
        var settings = $.extend({}, $.tutorialOverlay.defaults);
        settings.overlay = manualLoadOverlayId;
        settings.hideOnClick = false; //prevent lingering event listener reference
        return settings;
    };

    describe("$.tutorialOverlay.create", function () {
        afterEach(function () {
            $(manualLoadOverlayId).removeData(instanceDataAttr);
        });

        it("should create a new Tutorial Overlay with the correct settings", function () {
            var settings = getOverlaySettings();
            var key = "test key";
            var value = "test value";
            settings[key] = value;

            var overlay = $.tutorialOverlay.create(settings);
            var newSettings = $.extend({}, overlay.settings);
            assert(newSettings.overlay.is(settings.overlay), "The Overlay's settings.overlay jQuery object should be equivalent to $(settings.overlay)");

            //overwrite newSettings.overlay entry and deeply compare the rest of the objects
            newSettings.overlay = settings.overlay;
            assert.deepEqual(newSettings, settings);
        });

        it("should throw an Error if no element is specified for the overlay", function () {
            var settings = $.extend({}, $.tutorialOverlay.defaults);
            delete settings.overlay;

            assert.throws(
                function () {
                    $.tutorialOverlay.create(settings);
                },
                Error
            );
        });
        it("should throw an Error if the specified overlay element is not found", function () {
            var settings = $.extend({}, $.tutorialOverlay.defaults);
            settings.overlay = "#invalidId";

            assert.throws(
                function () {
                    $.tutorialOverlay.create(settings);
                },
                Error
            );
        });
        it("should throw an Error if the specified overlay element is already being used as an overlay", function () {
            var settings = getOverlaySettings();
            //create initial Tutorial Overlay
            $.tutorialOverlay.create(settings);

            //Verify that an additional attempt to create the same Tutorial Overlay throws an Error
            assert.throws(
                function () {
                    $.tutorialOverlay.create(settings);
                },
                Error
            );
        });

        it("should set the instance on the element data", function () {
            var settings = getOverlaySettings();

            var overlay = $.tutorialOverlay.create(settings);
            var $overlay = overlay.settings.overlay;

            var existingOverlay = $overlay.tutorialOverlayInstance();
            assert.strictEqual(existingOverlay, overlay);
        });
    });

    describe("$.fn.tutorialOverlayInstance", function () {
        afterEach(function () {
            $(manualLoadOverlayId).removeData(instanceDataAttr);
        });

        it("should return data when no argument specified", function () {
            assert(!$(manualLoadOverlayId).tutorialOverlayInstance(), "overlay element should have " + instanceDataAttr + " data BEFORE overlay creation");
            var value = {
                key: "value"
            };
            $(manualLoadOverlayId).data(instanceDataAttr, value);
            assert.strictEqual($(manualLoadOverlayId).tutorialOverlayInstance(), value);
        });


        it("should set the element data as specified", function () {
            var value = {
                key: "value"
            };
            $(manualLoadOverlayId).tutorialOverlayInstance(value);
            assert.strictEqual($(manualLoadOverlayId).tutorialOverlayInstance(), value);
        });
    });

    describe("$.fn.tutorialOverlay", function () {
        afterEach(function () {
            $(manualLoadOverlayId).removeData(instanceDataAttr);
        });

        it("should create a Tutorial Overlay when settings are specified", function () {
            var settings = getOverlaySettings();

            var $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            assert.isNotNull($overlay);
            var overlay = $overlay.tutorialOverlayInstance();
            assert.isNotNull(overlay);
            assert(overlay.isShowing(), "The created Tutorial Overlay should be showing.");

            var newSettings = $.extend({}, overlay.settings);
            assert(newSettings.overlay.is(settings.overlay), "The Overlay's settings.overlay jQuery object should be equivalent to $(settings.overlay)");
            assert(newSettings.overlay.is($overlay), "The Overlay's settings.overlay jQuery object should be equivalent to the returned jQuery object");

            //overwrite newSettings.overlay entry and deeply compare the rest of the objects
            newSettings.overlay = settings.overlay;
            assert.deepEqual(newSettings, settings);
        });
        it("should create a Tutorial Overlay when no parameters are specified", function () {
            var $overlay = $(manualLoadOverlayId).tutorialOverlay();
            assert.isNotNull($overlay);
            var overlay = $overlay.tutorialOverlayInstance();
            assert.isNotNull(overlay);
            assert(overlay.isShowing(), "The created Tutorial Overlay should be showing.");

            var newSettings = $.extend({}, overlay.settings);
            assert(newSettings.overlay.is(manualLoadOverlayId), "The Overlay's settings.overlay jQuery object should be equivalent to $(settings.overlay)");
            assert(newSettings.overlay.is($overlay), "The Overlay's settings.overlay jQuery object should be equivalent to the returned jQuery object");
        });
    });

    describe("settings.hideOnClick", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.
        var settings;
        beforeEach(function () {
            settings = getOverlaySettings();
        });

        afterEach(function () {
            overlay.setHideOnClick(false); //clear the click handler, since we re-use the element
            overlay.hide();
            $overlay.hide();
        });
        it("should hide the overlay on click if settings.hideOnClick", function () {
            settings.hideOnClick = true;

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();

            if (!overlay.isShowing()) {
                overlay.show();
            }
            $overlay.click();
            assert(!overlay.isShowing(), "The overlay was hidden when clicked.");
        });
        it("should not hide the overlay on click if !settings.hideOnClick", function () {
            settings.hideOnClick = false;

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();

            if (!overlay.isShowing()) {
                overlay.show();
            }
            $overlay.click();
            assert(overlay.isShowing(), "The overlay was not hidden when clicked.");
        });
    });

    describe("#.isShowing", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.
        beforeEach(function () {
            var settings = getOverlaySettings();

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();
        });

        afterEach(function () {
            overlay.hide();
            $overlay.hide();
        });

        it("should return TRUE when the overlay element is visible", function () {
            $overlay.show();
            var result = overlay.isShowing();
            assert(result, "The Tutorial Overlay is visible.");
        });
        it("should return FALSE when the overlay element is not visible", function () {
            $overlay.hide();
            var result = overlay.isShowing();
            assert(!result, "The Tutorial Overlay is not visible.");
        });
        it("should reflect the state of the overlay after show()", function () {
            overlay.show();
            var result = overlay.isShowing();
            assert(result, "The Tutorial Overlay is visible.");
        });
        it("should reflect the state of the overlay after hide()", function () {
            overlay.hide();
            var result = overlay.isShowing();
            assert(!result, "The Tutorial Overlay is not visible.");
        });

        it("should return TRUE when the overlay element is visible (idiomatic jQuery interface)", function () {
            $overlay.show();
            var result = $(manualLoadOverlayId).tutorialOverlay("isShowing");
            assert(result, "The Tutorial Overlay is visible.");
        });
        it("should return FALSE when the overlay element is not visible (idiomatic jQuery interface)", function () {
            $overlay.hide();
            var result = $(manualLoadOverlayId).tutorialOverlay("isShowing");
            assert(!result, "The Tutorial Overlay is not visible.");
        });
        it("should reflect the state of the overlay after show() (idiomatic jQuery interface)", function () {
            overlay.show();
            var result = $(manualLoadOverlayId).tutorialOverlay("isShowing");
            assert(result, "The Tutorial Overlay is visible.");
        });
        it("should reflect the state of the overlay after hide() (idiomatic jQuery interface)", function () {
            overlay.hide();
            var result = $(manualLoadOverlayId).tutorialOverlay("isShowing");
            assert(!result, "The Tutorial Overlay is not visible.");
        });
    });

    describe("#.show", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.
        beforeEach(function () {
            var settings = getOverlaySettings();

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();
        });

        afterEach(function () {
            overlay.hide();
            $overlay.hide();
        });

        it("should make the element visible", function () {
            if (overlay.isShowing()) {
                overlay.hide();
            }
            overlay.show();
            assert($overlay.is(":visible"), "The Tutorial Overlay is visible.");
        });
        it("should make the element visible (idiomatic jQuery)", function () {
            if (overlay.isShowing()) {
                overlay.hide();
            }
            $(manualLoadOverlayId).tutorialOverlay("show");
            assert($overlay.is(":visible"),
                "The idiomatic jQuery invocation of the function should be equivalent to the traditional invocation.");
        });
        it("should render the overlay", function () {
            var renderWasCalled = false;
            overlay.render = function () {
                renderWasCalled = true;
            };
            if (overlay.isShowing()) {
                overlay.hide();
            }
            overlay.show();
            assert(renderWasCalled, "The render() function was invoked when shown.");
        });
        it("should not render the overlay if already showing", function () {
            if (!overlay.isShowing()) {
                overlay.show();
            }
            var renderWasCalled = false;
            overlay.render = function () {
                renderWasCalled = true;
            };
            overlay.show();
            assert(!renderWasCalled, "The render() function was not invoked by show().");
        });
    });

    describe("#.hide", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.
        beforeEach(function () {
            var settings = getOverlaySettings();

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();
        });

        afterEach(function () {
            overlay.hide();
            $overlay.hide();
        });

        it("should hide the element", function () {
            if (!overlay.isShowing()) {
                overlay.show();
            }
            overlay.hide();
            assert(!$overlay.is(":visible"), "The Tutorial Overlay is not visible.");
        });
        it("should hide the element (idiomatic jQuery)", function () {
            if (!overlay.isShowing()) {
                overlay.show();
            }
            $(manualLoadOverlayId).tutorialOverlay("hide");
            assert(!$overlay.is(":visible"),
                "The idiomatic jQuery invocation of the function should be equivalent to the traditional invocation.");
        });
        it("should destroy the overlay if settings.destroyOnClose", function () {
            overlay.settings.destroyOnClose = true;
            var destroyWasCalled = false;
            overlay.destroy = function () {
                destroyWasCalled = true;
            };
            if (!overlay.isShowing()) {
                overlay.show();
            }
            overlay.hide();
            assert(destroyWasCalled, "The destroy() function was invoked when hid.");
        });
        it("should not destroy the overlay if !settings.destroyOnClose", function () {
            var destroyWasCalled = false;
            overlay.destroy = function () {
                destroyWasCalled = true;
            };
            if (!overlay.isShowing()) {
                overlay.show();
            }
            overlay.hide();
            assert(!destroyWasCalled, "The destroy() function was not invoked when hid.");
        });
    });

    describe("#.destroy", function () {
        var overlayId = "#temporary-overlay";
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.
        beforeEach(function () {
            var settings = getOverlaySettings();
            settings.overlay = overlayId;

            if ($(overlayId).length === 0) {
                $("#test-div").append("<div id='" + overlayId.substr(1) + "' class='tutorial-overlay'></div>");
            }

            $overlay = $(overlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();
        });

        it("should remove the element from the DOM", function () {
            var $beforeDestroy = $(overlayId);
            assert.lengthOf($beforeDestroy, 1, "The Tutorial Overlay element exists in the DOM.");
            overlay.destroy();
            var $afterDestroy = $(overlayId);
            assert.lengthOf($afterDestroy, 0, "The Tutorial Overlay element was removed from the DOM.");
        });
        it("should remove the element from the DOM (idiomatic jQuery)", function () {
            var $beforeDestroy = $(overlayId);
            assert.lengthOf($beforeDestroy, 1, "The Tutorial Overlay element exists in the DOM.");
            $(overlayId).tutorialOverlay("destroy");
            var $afterDestroy = $(overlayId);
            assert.lengthOf($afterDestroy, 0, "The Tutorial Overlay element was removed from the DOM.");
        });
    });

    describe("#.addTip", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.
        var prevOverlayTipFactory;
        var originalOptions, tipOptions;

        before(function () {
            prevOverlayTipFactory = $.tutorialOverlay.createTip;
            $.tutorialOverlay.createTip = function (options) {
                tipOptions = options;
            };
            var settings = getOverlaySettings();

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();

            originalOptions = {
                testkey: "test-value",
                position: "nne"
            };
        });
        after(function () {
            overlay.hide();
            $overlay.hide();
            $.tutorialOverlay.createTip = prevOverlayTipFactory;
        });

        it("should create a Tip with the correct options", function () {
            overlay.addTip($.extend({}, originalOptions));
            assert.strictEqual(tipOptions.testkey, originalOptions.testkey);
        });
        it("should create a Tip with the correct options (idiomatic jQuery)", function () {
            $(manualLoadOverlayId).tutorialOverlay("addTip", $.extend({}, originalOptions));
            assert.strictEqual(tipOptions.testkey, originalOptions.testkey);
        });
        it("should translate 'position' options into 'direction' options", function () {
            overlay.addTip($.extend({}, originalOptions));
            assert.strictEqual(tipOptions.direction, originalOptions.position);
        });
    });

    describe("#.setCenterContent", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.
        var centerContentId = "#center-content";

        beforeEach(function () {
            var settings = getOverlaySettings();

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();
        });
        afterEach(function () {
            overlay.hide();
            $overlay.hide();
        });

        it("should set the centerContent jQuery element of the overlay", function () {
            overlay.setCenterContent(centerContentId);
            assert(overlay._$centerContent.is(centerContentId), "overlay center content is the element specified by centerContentId");
            assert(overlay._$centerContent.is($(centerContentId)), "overlay center content is the element specified by centerContentId");
        });
        it("should set the centerContent jQuery element of the overlay (idiomatic jQuery)", function () {
            $(manualLoadOverlayId).tutorialOverlay("setCenterContent", centerContentId);
            assert(overlay._$centerContent.is(centerContentId), "overlay center content is the element specified by centerContentId");
            assert(overlay._$centerContent.is($(centerContentId)), "overlay center content is the element specified by centerContentId");
        });
    });

    describe("#.render", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.

        beforeEach(function () {
            var settings = getOverlaySettings();

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();
        });
        afterEach(function () {
            overlay.hide();
            $overlay.hide();
        });

        it("should render all Tips", function () {
            var tipRendered = [];
            var i;
            var tipRender = function () {
                tipRendered[this.renderIndex] = true;
            };
            for (i = 0; i < overlay._tips.length; i++) {
                overlay._tips[i].renderIndex = i;
                overlay._tips[i].render = tipRender;
            }
            overlay.render();
            for (i = 0; i < overlay._tips.length; i++) {
                assert(tipRendered[overlay._tips[i].renderIndex], "Tip was rendered");
            }
        });
        it("should show the element", function () {
            overlay.render();
            assert($overlay.is(":visible"), "The overlay is visible");
        });
        it("should center the centerContent", function () {
            var $window = $(window);
            var $centerContent = $("#center-content");
            var contentWidth = 100;
            var contentHeight = 100;

            var expectedContentX = ($window.width() - contentWidth) / 2;
            var expectedContentY = ($window.height() - contentHeight) / 2;

            //Mock clientRect() function
            var origClientRect = $.fn.clientRect;
            $.fn.clientRect = function () {
                return {
                    top: 0,
                    left: 0,
                    width: contentWidth,
                    height: contentHeight,
                    right: contentWidth,
                    bottom: contentHeight
                };
            };
            overlay.setCenterContent($centerContent);
            overlay.render();
            var contentLocation = $centerContent.offset();
            assert.strictEqual(contentLocation.left, expectedContentX);
            assert.strictEqual(contentLocation.top, expectedContentY);
            $.fn.clientRect = origClientRect;
        });
    });

    describe("#._ensureVeil", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.

        beforeEach(function () {
            var settings = getOverlaySettings();

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();
        });
        afterEach(function () {
            overlay.hide();
            $overlay.hide();
        });

        it("should add a veil element to the DOM if one cannot be found", function () {
            if (overlay._$veil) {
                overlay._$veil.remove();
                delete overlay._$veil;
            }
            overlay._ensureVeil();
            var $newVeil = overlay._$veil;
            assert.isNotNull($newVeil);
            assert.lengthOf($newVeil, 1);
            assert($newVeil.is(".tutorial-overlay-veil"), "The new veil element has the correct class");
            assert($.contains(overlay._$overlay[0], $newVeil[0]), "The Overlay contains the new veil element");
        });
        it("should set _$veil if needed", function () {
            if (overlay._$veil) {
                delete overlay._$veil;
            }
            overlay._ensureVeil();
            var $newVeil = overlay._$veil;
            assert.isNotNull($newVeil);
            assert.lengthOf($newVeil, 1);
            assert($newVeil.is(".tutorial-overlay-veil"), "The new veil element has the correct class");
            assert($.contains(overlay._$overlay[0], $newVeil[0]), "The Overlay contains the new veil element");
        });
        it("should not change _$veil if the property already has a value", function () {
            if (!overlay._$veil) {
                overlay._ensureVeil();
            }
            var $oldVeil = overlay._$veil;
            assert.isNotNull($oldVeil);

            //subsequent invocations should be noops
            overlay._ensureVeil();

            var $newVeil = overlay._$veil;
            assert.strictEqual($newVeil, $oldVeil);
        });
    });

    describe("#._ensureCanvas", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.

        beforeEach(function () {
            var settings = getOverlaySettings();

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();
        });
        afterEach(function () {
            overlay.hide();
            $overlay.hide();
        });

        it("should add a canvas element to the DOM if one cannot be found", function () {
            if (overlay._$canvas) {
                overlay._$canvas.remove();
                delete overlay._$canvas;
            }
            overlay._ensureCanvas();
            var $newCanvas = overlay._$canvas;
            assert.isNotNull($newCanvas);
            assert.lengthOf($newCanvas, 1);
            assert($newCanvas.is(".tutorial-overlay-canvas"), "The new canvas element has the correct class");
            assert($.contains(overlay._$overlay[0], $newCanvas[0]), "The Overlay contains the new canvas element");
        });
        it("should set _$canvas if needed", function () {
            if (overlay._$canvas) {
                delete overlay._$canvas;
            }
            overlay._ensureCanvas();
            var $newCanvas = overlay._$canvas;
            assert.isNotNull($newCanvas);
            assert.lengthOf($newCanvas, 1);
            assert($newCanvas.is(".tutorial-overlay-canvas"), "The new canvas element has the correct class");
            assert($.contains(overlay._$overlay[0], $newCanvas[0]), "The Overlay contains the new canvas element");
        });
        it("should not change _$canvas if the property already has a value", function () {
            if (!overlay._$canvas) {
                overlay._ensurecanvas();
            }
            var $oldCanvas = overlay._$canvas;
            assert.isNotNull($oldCanvas);

            //subsequent invocations should be noops
            overlay._ensureCanvas();

            var $newCanvas = overlay._$canvas;
            assert.strictEqual($newCanvas, $oldCanvas);
        });
    });

    describe("#._initializeTips", function () {
        var $overlay; //The jQuery object for the overlay.
        var overlay; //The Tutorial Overlay created for this test.

        beforeEach(function () {
            var settings = getOverlaySettings();

            $overlay = $(manualLoadOverlayId).tutorialOverlay(settings);
            overlay = $overlay.tutorialOverlayInstance();
        });
        afterEach(function () {
            overlay.hide();
            $overlay.hide();
        });

        it("should add Tips to the overlay", function () {
            overlay._tips = [];

            overlay._initializeTips();

            assert.isNotNull(overlay._tips);
            assert.lengthOf(overlay._tips, 2);
        });
        it("should do nothing if _$overlay is not set", function () {
            var $oldOverlay = overlay._$overlay;
            delete overlay._$overlay;
            overlay._tips = [];
            overlay._initializeTips();
            assert.lengthOf(overlay._tips, 0);
            overlay._$overlay = $oldOverlay;
        });
    });
});