describe("jquery.tutorialOverlay.Tip", function () {
    var assert = chai.assert;

    var tipOptions = {
        direction: "north",
        offset: 5,
        color: "#D00D1E"
    };

    // Perhaps this should be a method in jquery.rectUtils?
    var rectEquals = function (rect, top, left, width, height) {
        assert.equal(rect.top, top, "rect.top should be equal");
        assert.equal(rect.left, left, "rect.left should be equal");
        assert.equal(rect.width, width, "rect.width should be equal");
        assert.equal(rect.height, height, "rect.height should be equal");

        //Check right and bottom only if they exist
        if ("right" in rect) {
            assert.equal(rect.right, left + width);
        }
        if ("bottom" in rect) {
            assert.equal(rect.bottom, top + height);
        }
    };

    after(function () {
        $("#test-div").hide();
    });

    describe("$.tutorialOverlay.createTip", function () {
        var options = $.extend({}, tipOptions);
        options.content = "#test-tip";
        options.target = "h3";
        var tip = $.tutorialOverlay.createTip(options);
        it("should create a Tip with the correct offset", function () {
            assert.strictEqual(tip.getOffset(), options.offset);
        });
        it("should create a Tip with the correct content", function () {
            assert.strictEqual(tip.content, options.content);
        });
        it("should create a Tip with the correct target", function () {
            assert.strictEqual(tip.target, options.target);
        });
    });

    describe("$.fn.tutorialOverlayTip", function () {
        var $tip = $(".tutorial-overlay-tip");
        var offset = 13;
        $tip.data("overlay-tip-offset", offset);
        var target = $tip.data("overlay-tip-target");
        var content = $tip[0];

        var tip = $tip.tutorialOverlayTip();

        it("should create a Tip with the correct offset", function () {
            assert.strictEqual(tip.getOffset(), offset);
        });
        it("should create a Tip with the correct content", function () {
            assert.strictEqual(tip.content, content);
        });
        it("should create a Tip with the correct target", function () {
            assert.strictEqual(tip.target, target);
        });
    });

    describe("#.getTipEl", function () {
        var options = $.extend({}, tipOptions);
        options.content = "#test-tip";
        options.target = "h3";
        var tip = $.tutorialOverlay.createTip(options);
        var tipEl = tip.getTipEl();
        it("should create a Tip with the correct content element", function () {
            assert.deepEqual(tipEl, $(options.content), "jQuery objects are equal");
        });
        it("should return the cached results on subsequent invocations", function () {
            assert.strictEqual(tip.getTipEl(), tipEl);
        });
    });

    describe("#.getTipBounds", function () {
        //set up test target bounds
        var targetId = "#test-target";
        var targetTop = 100;
        var targetLeft = 100;
        var targetWidth = 25;
        var targetHeight = 25;
        var windowSize = {
            width: 1024,
            height: 1024
        };

        var $target = $(targetId);
        $target.css({
            position: "absolute",
            top: targetTop + "px",
            left: targetLeft + "px",
            width: targetWidth + "px",
            height: targetHeight + "px"
        });

        var options = $.extend({}, tipOptions);
        options.content = "#test-tip";
        options.target = targetId;
        var tip = $.tutorialOverlay.createTip(options);

        describe("target is off screen", function () {
            var testOffScreen = function (description, top, left) {
                it(description + " should return null", function () {
                    $target.css({
                        top: top + "px",
                        left: left + "px"
                    });
                    assert.isNull(tip.getTipBounds(windowSize));
                });
            };

            testOffScreen("NorthWest", (-targetHeight / 2), (-targetWidth / 2));
            testOffScreen("North", (-targetHeight / 2), targetLeft);
            testOffScreen("NorthEast", (-targetHeight / 2), (windowSize.width - targetWidth / 2));
            testOffScreen("East", targetTop, (windowSize.width - targetWidth / 2));
            testOffScreen("SouthEast", (windowSize.height - targetHeight / 2), (windowSize.width - targetWidth / 2));
            testOffScreen("South", (windowSize.height - targetHeight / 2), targetLeft);
            testOffScreen("SouthWest", (windowSize.height - targetHeight / 2), (-targetWidth / 2));
            testOffScreen("West", targetTop, (-targetWidth / 2));
        });

        describe("invalid target", function () {
            it("should return null if the target element is not found", function () {
                var tipOptions = $.extend({}, options);
                tipOptions.target = "invalid target";
                var testTip = $.tutorialOverlay.createTip(tipOptions);
                assert.isNull(testTip.getTipBounds(windowSize));
            });
            it("should return null if the target is not showing", function () {
                $target.css({
                    display: "none",
                    top: targetTop + "px",
                    left: targetLeft + "px",
                    width: targetWidth + "px",
                    height: targetHeight + "px"
                });
                assert.isNull(tip.getTipBounds(windowSize));
                $target.css({
                    display: "block"
                });
            });
        });

        describe("valid target", function () {
            //Mock methods used in testing
            var origClientRect, origCreateArrow, origCalcRestrainedPos;
            before(function () {
                //Store original methods
                origClientRect = $.fn.clientRect;
                origCreateArrow = $.tutorialOverlay.createArrow;
                origCalcRestrainedPos = $.fn.calcRestrainedPos;

                //Mock createArrow
                $.tutorialOverlay.createArrow = function () {
                    //a mock Arrow
                    return {
                        addToTip: function () {
                            //noop
                        }
                    };
                };
            });

            //Reset the mocked methods to their original values
            after(function () {
                $.fn.clientRect = origClientRect;
                $.tutorialOverlay.createArrow = origCreateArrow;
                $.fn.calcRestrainedPos = origCalcRestrainedPos;
            });

            it("should return null if calcRestrainedPos cannot position the tip", function () {
                $.fn.calcRestrainedPos = function () {
                    return null;
                };
                assert.isNull(tip.getTipBounds(windowSize)); //calcRestrainedPos was mocked to always return null
            });

            it("should return rectangle with position determined by calcRestrainedPos", function () {
                var tipTop = 100;
                var tipLeft = 101;
                var tipWidth = 50;
                var tipHeight = 51;

                var newLeft = 213;
                var newTop = 342;

                //Mock clientRect
                $.fn.clientRect = function () {
                    return {
                        top: tipTop,
                        left: tipLeft,
                        width: tipWidth,
                        height: tipHeight
                    };
                };
                //Mock calcRestrainedPos
                $.fn.calcRestrainedPos = function () {
                    return {
                        pos: {
                            left: newLeft,
                            top: newTop
                        }
                    };
                };
                var tipRect = tip.getTipBounds(windowSize);
                rectEquals(tipRect, newTop, newLeft, tipWidth, tipHeight);
            });
        });
    });

    describe("#.render", function () {
        var arrowPadding = 5;
        var arrowSize = 43;
        var arrowIsValid = true;
        var methodCount;

        //Mock methods used in testing
        var origClientRect, origCreateArrow, origCalcRestrainedPos;
        before(function () {
            //Store original methods
            origClientRect = $.fn.clientRect;
            origCreateArrow = $.tutorialOverlay.createArrow;
            origCalcRestrainedPos = $.fn.calcRestrainedPos;

            //Mock createArrow
            $.tutorialOverlay.createArrow = function () {
                //a mock Arrow
                methodCount["createArrow"]++;
                return {
                    getSize: function () {
                        methodCount["getSize"]++;
                        return arrowSize;
                    },
                    getPadding: function () {
                        methodCount["getPadding"]++;
                        return arrowPadding;
                    },
                    addToTip: function () {
                        methodCount["addToTip"]++;
                        //noop
                    },
                    render: function () {
                        methodCount["render"]++;
                        //noop
                    },
                    translate: function () {
                        methodCount["translate"]++;
                        //noop
                    },
                    isValid: function () {
                        methodCount["isValid"]++;
                        return arrowIsValid;
                    },
                    toggleDirection: function () {
                        methodCount["toggleDirection"]++;
                        //noop
                    }
                };
            };
        });

        //Reset the mocked methods to their original values
        after(function () {
            $.fn.clientRect = origClientRect;
            $.tutorialOverlay.createArrow = origCreateArrow;
            $.fn.calcRestrainedPos = origCalcRestrainedPos;
        });

        //Reset the method counts before each test
        beforeEach(function () {
            methodCount = {
                createArrow: 0,
                getSize: 0,
                getPadding: 0,
                addToTip: 0,
                render: 0,
                translate: 0,
                isValid: 0,
                toggleDirection: 0
            };
        });

        var overlaySize = {
            width: 1000,
            height: 1000
        };

        var options = $.extend({}, tipOptions);
        options.content = "#test-tip";
        options.target = "h3";
        options.direction = "north";

        var tipRect = $(options.content).clientRect();

        var tip = $.tutorialOverlay.createTip(options);

        var testRender = function (rect) {
            //If everything is Mocked, then we expect the rect to remain unchanged.
            rectEquals(rect, tipRect.top, tipRect.left, tipRect.width, tipRect.height);

            //Make sure that the Arrow was rendered and only one time.
            assert.strictEqual(methodCount["render"], 1, "Arrow.render should be invoked exactly once");

            //Make sure the Tip is visible, since it was rendered.
            assert($(options.content).is(":visible"), "Tip should be visible if it was rendered");

            //Make sure the 'top' and 'left' style attributes were set correctly (i.e. the Tip was re-positioned)
            var cssTop = $(tip.content).css("top");
            assert(cssTop.match(/(\d+)px/), "Tip style sould contain a 'top' attribute");
            cssTop = parseFloat(cssTop.substr(0, cssTop.length - 2), 10);
            assert.strictEqual(cssTop, tipRect.top, "Tip's top should have been set");
            var cssLeft = $(tip.content).css("left");
            assert(cssLeft.match(/(\d+)px/), "Tip style sould contain a 'left' attribute");
            cssLeft = parseFloat(cssLeft.substr(0, cssLeft.length - 2), 10);
            assert.strictEqual(cssLeft, tipRect.left, "Tip's left should have been set");
        };

        it("should hide the Tip if tipRect is undefined", function () {
            $(options.content).show();
            tip.render();
            assert(!$(options.content).is(":visible"), "Tip should not be visible if tipRect is undefined");
        });
        it("should hide the Tip if tipRect is null", function () {
            $(options.content).show();
            tip.render(null);
            assert(!$(options.content).is(":visible"), "Tip should not be visible if tipRect is null");
        });
        it("should hide the Tip if it cannot be positioned on the screen", function () {
            $.fn.calcRestrainedPos = function () {
                return null;
            };
            $(options.content).show();
            tip.render(tipRect, null, overlaySize, null);
            assert(!$(options.content).is(":visible"), "Tip should not be visible if tipRect cannot be positioned");
        });
        it("should adjust the Arrow if the Tip is positioned in a different direction", function () {
            $.fn.calcRestrainedPos = function () {
                return {
                    direction: "south",
                    pos: {
                        top: tipRect.top,
                        left: tipRect.left
                    }
                };
            };

            var rect = $.extend({}, tipRect);
            tip.render(rect, null, overlaySize, null);
            assert.strictEqual(methodCount["createArrow"], 4, "$.tutorialOverlay.createArrow should be invoked an extra time if the calculated direction is different from the one requested");
            assert.strictEqual(methodCount["addToTip"], 4, "Arrow.addToTip should be invoked an extra time if the calculated direction is different from the one requested");

            testRender(rect);
        });
        it("should NOT adjust the Arrow if the Tip is positioned in a different direction", function () {
            $.fn.calcRestrainedPos = function () {
                return {
                    direction: options.direction,
                    pos: {
                        top: tipRect.top,
                        left: tipRect.left
                    }
                };
            };

            var rect = $.extend({}, tipRect);
            tip.render(rect, null, overlaySize, null);
            assert.strictEqual(methodCount["createArrow"], 3, "$.tutorialOverlay.createArrow should NOT be invoked an extra time if the Tip position did not change");
            assert.strictEqual(methodCount["addToTip"], 3, "Arrow.addToTip should NOT be invoked an extra time if the Tip position did not change");

            testRender(rect);
        });
        it("should toggle the Arrow direction if needed", function () {
            $.fn.calcRestrainedPos = function () {
                return {
                    direction: options.direction,
                    pos: {
                        top: tipRect.top,
                        left: tipRect.left
                    }
                };
            };
            var arrowWasValid = arrowIsValid;
            arrowIsValid = false;

            var rect = $.extend({}, tipRect);
            tip.render(rect, null, overlaySize, null);
            assert.strictEqual(methodCount["toggleDirection"], 1, "Arrow.toggleDirection should be invoked if Arrow.isValid is false");

            testRender(rect);

            arrowIsValid = arrowWasValid;
        });
        it("should add the repositioned Tip bounds to the list of occupiedRects", function () {
            $.fn.calcRestrainedPos = function () {
                return {
                    direction: options.direction,
                    pos: {
                        top: tipRect.top,
                        left: tipRect.left
                    }
                };
            };

            var occupiedRects = [];
            var rect = $.extend({}, tipRect);
            tip.render(rect, null, overlaySize, occupiedRects);
            assert.strictEqual(methodCount["createArrow"], 3, "$.tutorialOverlay.createArrow should NOT be invoked an extra time");
            assert.strictEqual(methodCount["addToTip"], 4, "Arrow.addToTip should be invoked an extra time if the Tip is added to the list of occupiedRects");
            assert.deepEqual(occupiedRects[0], rect, "tipRect was added to the occupiedRects array");

            testRender(rect);
        });
    });

    describe("#._addArrow", function () {
        //Test _addArrow private function for each tip position and possible arrow direction
        //For each different tip position:
        //  Try tipRect on both sides of overlaySize center.

        //Mock createArrow
        var origCreateArrow;
        before(function () {
            origCreateArrow = $.tutorialOverlay.createArrow;

            //Mock createArrow
            $.tutorialOverlay.createArrow = function (tipRect, arrowOptions) {
                //a mock Arrow
                return {
                    tipRect: tipRect,
                    arrowOptions: arrowOptions
                };
            };
        });

        after(function () {
            $.tutorialOverlay.createArrow = origCreateArrow;
        });

        var overlaySize = {
            width: 1000,
            height: 1000
        };
        var arrowOptions = {
            size: 40,
            padding: 5,
            headSize: 10
        };

        //center of overlay
        var overlayCenterX = overlaySize.width / 2;
        var overlayCenterY = overlaySize.height / 2;
        //max possible size of arrow
        var arrowSize = arrowOptions.size + arrowOptions.padding + arrowOptions.headSize;

        var tipRect = {
            top: 200,
            left: 150,
            width: 100,
            height: 50
        };

        var testAddArrow = function (tipPosition, initialTipRect, expectedTipRect, expectedArrowDirection, overlaySize, arrowOptions) {
            it(tipPosition + " should return a " + expectedArrowDirection + " Arrow", function () {
                var options = $.extend({}, tipOptions);
                options.content = "#test-tip";
                options.target = "h3";
                var tip = $.tutorialOverlay.createTip(options);

                var overlaySizeCopy = $.extend({}, overlaySize);
                var arrow = tip._addArrow(initialTipRect, tipPosition, overlaySizeCopy, arrowOptions);
                rectEquals(arrow.tipRect, expectedTipRect.top, expectedTipRect.left, expectedTipRect.width, expectedTipRect.height);
                assert.deepEqual(overlaySizeCopy, overlaySize, "_addArrow should not change the overlay size object");
                assert.strictEqual(arrow.arrowOptions.direction, expectedArrowDirection, "_addArrow should create an arrow with the expected direction");
            });
        };

        var initialTipRect, expectedTipRect;

        //North position, left of overlay center
        initialTipRect = $.extend({}, tipRect);
        expectedTipRect = $.extend({}, tipRect);

        initialTipRect.left = overlayCenterX - (initialTipRect.width + arrowSize + 5);
        expectedTipRect.left = initialTipRect.left - (arrowOptions.size + expectedTipRect.width / 2);
        expectedTipRect.top = initialTipRect.top - (arrowOptions.size - tipRect.height / 2);
        testAddArrow(
            "north",
            initialTipRect,
            expectedTipRect,
            "SSE",
            overlaySize,
            arrowOptions
        );

        //North position, right overlay center
        initialTipRect = $.extend({}, tipRect);
        expectedTipRect = $.extend({}, tipRect);

        initialTipRect.left = overlayCenterX + (initialTipRect.width + arrowSize + 5);
        expectedTipRect.left = initialTipRect.left + (arrowOptions.size + expectedTipRect.width / 2);
        expectedTipRect.top = initialTipRect.top - (arrowOptions.size - tipRect.height / 2);
        testAddArrow(
            "north",
            initialTipRect,
            expectedTipRect,
            "SSW",
            overlaySize,
            arrowOptions
        );

        //South position, left of overlay center
        initialTipRect = $.extend({}, tipRect);
        expectedTipRect = $.extend({}, tipRect);

        initialTipRect.left = overlayCenterX - (initialTipRect.width + arrowSize + 5);
        expectedTipRect.left = initialTipRect.left - (arrowOptions.size + expectedTipRect.width / 2);
        expectedTipRect.top = initialTipRect.top + (arrowOptions.size - tipRect.height / 2);
        testAddArrow(
            "south",
            initialTipRect,
            expectedTipRect,
            "NNE",
            overlaySize,
            arrowOptions
        );

        //South position, right overlay center
        initialTipRect = $.extend({}, tipRect);
        expectedTipRect = $.extend({}, tipRect);

        initialTipRect.left = overlayCenterX + (initialTipRect.width + arrowSize + 5);
        expectedTipRect.left = initialTipRect.left + (arrowOptions.size + expectedTipRect.width / 2);
        expectedTipRect.top = initialTipRect.top + (arrowOptions.size - tipRect.height / 2);
        testAddArrow(
            "south",
            initialTipRect,
            expectedTipRect,
            "NNW",
            overlaySize,
            arrowOptions
        );

        //East position, above overlay center
        initialTipRect = $.extend({}, tipRect);
        expectedTipRect = $.extend({}, tipRect);

        initialTipRect.top = overlayCenterY - (initialTipRect.height + arrowSize + 5);
        expectedTipRect.left = initialTipRect.left + (arrowOptions.size / 2);
        expectedTipRect.top = initialTipRect.top - (arrowOptions.size + tipRect.height / 2);
        testAddArrow(
            "east",
            initialTipRect,
            expectedTipRect,
            "WSW",
            overlaySize,
            arrowOptions
        );

        //East position, below overlay center
        initialTipRect = $.extend({}, tipRect);
        expectedTipRect = $.extend({}, tipRect);

        initialTipRect.top = overlayCenterY + (initialTipRect.height + arrowSize + 5);
        expectedTipRect.left = initialTipRect.left + (arrowOptions.size / 2);
        expectedTipRect.top = initialTipRect.top + (arrowOptions.size + tipRect.height / 2);
        testAddArrow(
            "east",
            initialTipRect,
            expectedTipRect,
            "WNW",
            overlaySize,
            arrowOptions
        );

        //West position, above overlay center
        initialTipRect = $.extend({}, tipRect);
        expectedTipRect = $.extend({}, tipRect);

        initialTipRect.top = overlayCenterY - (initialTipRect.height + arrowSize + 5);
        expectedTipRect.left = initialTipRect.left - (arrowOptions.size / 2);
        expectedTipRect.top = initialTipRect.top - (arrowOptions.size + tipRect.height / 2);
        testAddArrow(
            "west",
            initialTipRect,
            expectedTipRect,
            "ESE",
            overlaySize,
            arrowOptions
        );

        //West position, below overlay center
        initialTipRect = $.extend({}, tipRect);
        expectedTipRect = $.extend({}, tipRect);

        initialTipRect.top = overlayCenterY + (initialTipRect.height + arrowSize + 5);
        expectedTipRect.left = initialTipRect.left - (arrowOptions.size / 2);
        expectedTipRect.top = initialTipRect.top + (arrowOptions.size + tipRect.height / 2);
        testAddArrow(
            "west",
            initialTipRect,
            expectedTipRect,
            "ENE",
            overlaySize,
            arrowOptions
        );
    });
});