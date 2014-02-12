describe("jquery.tutorialOverlayArrow", function () {
    var DIRECTIONS = ["NNE", "NNW", "SSE", "SSW", "WSW", "WNW", "ESE", "ENE"];

    var assert = chai.assert;

    var arrowOptions = {
        padding: 5,
        size: 20,
        headSize: 7,
        direction: "ENE"
    };

    var tipRect = {
        top: 100,
        left: 100,
        width: 100,
        height: 100
    };

    // Perhaps this should be a method in jquery.rectUtils?
    var rectEquals = function (rect, top, left, width, height) {
        assert.equal(rect.top, top);
        assert.equal(rect.left, left);
        assert.equal(rect.width, width);
        assert.equal(rect.height, height);

        //Check right and bottom only if they exist
        if ("right" in rect) {
            assert.equal(rect.right, left + width);
        }
        if ("bottom" in rect) {
            assert.equal(rect.bottom, top + height);
        }
    };

    var getExpectedStartPt = function (tipRect, options, direction) {
        var pt;
        switch (direction) {
            default:
        case "SSE":
        case "NNE":
            pt = {
                x: (tipRect.left + tipRect.width) + options.padding,
                y: tipRect.top + tipRect.height / 2
            };
            break;

        case "SSW":
        case "NNW":
            pt = {
                x: tipRect.left - options.padding,
                y: tipRect.top + tipRect.height / 2
            };
            break;
        case "WSW":
            pt = {
                x: tipRect.left + options.size / 2,
                y: (tipRect.top + tipRect.height) + options.padding
            };
            break;

        case "WNW":
            pt = {
                x: tipRect.left + options.size / 2,
                y: tipRect.top - options.padding
            };
            break;

        case "ESE":
            pt = {
                x: (tipRect.left + tipRect.width) - options.size / 2,
                y: (tipRect.top + tipRect.height) + options.padding
            };
            break;

        case "ENE":
            pt = {
                x: (tipRect.left + tipRect.width) - options.size / 2,
                y: tipRect.top - options.padding
            };
            break;
        }
        return pt;
    };

    var getExpectedEndPt = function (tipRect, options, direction) {
        var pt;
        switch (direction) {
        case "SSE":
            pt = {
                x: (tipRect.left + tipRect.width) + options.size,
                y: (tipRect.top + tipRect.height / 2) + (options.size - options.padding)
            };
            break;

        default:
        case "NNE":
            pt = {
                x: (tipRect.left + tipRect.width) + options.size,
                y: (tipRect.top + tipRect.height / 2) - (options.size - options.padding)
            };
            break;

        case "SSW":
            pt = {
                x: tipRect.left - options.size,
                y: (tipRect.top + tipRect.height / 2) + (options.size - options.padding)
            };
            break;

        case "NNW":
            pt = {
                x: tipRect.left - options.size,
                y: (tipRect.top + tipRect.height / 2) - (options.size - options.padding)
            };
            break;

        case "WSW":
            pt = {
                x: tipRect.left - (options.size / 2) + options.padding,
                y: (tipRect.top + tipRect.height) + options.size
            };
            break;

        case "WNW":
            pt = {
                x: tipRect.left - (options.size / 2) + options.padding,
                y: tipRect.top - options.size
            };
            break;

        case "ESE":
            pt = {
                x: (tipRect.left + tipRect.width) + (options.size / 2) - options.padding,
                y: (tipRect.top + tipRect.height) + options.size
            };
            break;

        case "ENE":
            pt = {
                x: (tipRect.left + tipRect.width) + (options.size / 2) - options.padding,
                y: tipRect.top - options.size
            };
            break;
        }
        return pt;
    };

    var getExpectedControlPt = function (startX, startY, endX, endY, direction) {
        var pt;
        switch (direction) {
            default:
        case "SSE":
        case "NNE":
        case "SSW":
        case "NNW":
            pt = {
                x: endX,
                y: startY
            };
            break;

        case "WSW":
        case "WNW":
        case "ESE":
        case "ENE":
            pt = {
                x: startX,
                y: endY
            };
            break;
        }
        return pt;
    };

    var testPoints = function (direction) {
        var rect = $.extend({}, tipRect);
        var options = $.extend({}, arrowOptions);
        options.direction = direction;

        var pt = getExpectedStartPt(rect, options, options.direction);
        var expectedStartX = pt.x;
        var expectedStartY = pt.y;
        pt = getExpectedEndPt(rect, options, options.direction);
        var expectedEndX = pt.x;
        var expectedEndY = pt.y;
        pt = getExpectedControlPt(expectedStartX, expectedStartY, expectedEndX, expectedEndY, options.direction);
        var expectedControlX = pt.x;
        var expectedControlY = pt.y;

        options.drawFn = function (canvasContext, options) {
            assert.strictEqual(options.startX, expectedStartX);
            assert.strictEqual(options.startY, expectedStartY);
            assert.strictEqual(options.controlX, expectedControlX);
            assert.strictEqual(options.controlY, expectedControlY);
            assert.strictEqual(options.endX, expectedEndX);
            assert.strictEqual(options.endY, expectedEndY);
            assert.strictEqual(options.headSize, options.headSize);
        };

        var arrow = $.tutorialOverlay.createArrow(rect, options);

        arrow.render();
    };

    var testToggle = function (startDirection, toggledDirection, expectedTipRect) {
        var rect = $.extend({}, tipRect);
        var options = $.extend({}, arrowOptions);
        options.direction = startDirection;

        var prevStartX, prevStartY, prevEndX, prevEndY, prevControlX, prevControlY;

        options.drawFn = function (canvasContext, options) {
            prevStartX = options.startX;
            prevStartY = options.startY;
            prevEndX = options.endX;
            prevEndY = options.endY;
            prevControlX = options.controlX;
            prevControlY = options.controlY;
        };

        var arrow = $.tutorialOverlay.createArrow(rect, options);

        //For each direction, calculate expected new direction and expected new points.
        //  assert that the rect was properly translated,
        //  assert that toggling again restores the direction and points

        var description = startDirection;
        if (typeof (description) === "undefined") {
            description = "undefined";
        }
        describe(description, function () {
            arrow.toggleDirection(rect);
            var firstDirection = arrow.getDirection();
            var firstRect = $.extend({}, rect);

            var pt = getExpectedStartPt(rect, options, firstDirection);
            var firstExpectedStartX = pt.x;
            var firstExpectedStartY = pt.y;
            pt = getExpectedEndPt(rect, options, firstDirection);
            var firstExpectedEndX = pt.x;
            var firstExpectedEndY = pt.y;
            pt = getExpectedControlPt(firstExpectedStartX, firstExpectedStartY, firstExpectedEndX, firstExpectedEndY, firstDirection);
            var firstExpectedControlX = pt.x;
            var firstExpectedControlY = pt.y;

            it("should change the direction of the arrow from " + startDirection + " to " + toggledDirection, function () {
                assert.strictEqual(toggledDirection, firstDirection);
            });
            it("should translate the tip rect to make room for the arrow change", function () {
                rectEquals(firstRect, expectedTipRect.top, expectedTipRect.left, expectedTipRect.width, expectedTipRect.height);
            });
            arrow.render();
            var firstStartX = prevStartX;
            var firstStartY = prevStartY;
            var firstEndX = prevEndX;
            var firstEndY = prevEndY;
            var firstControlX = prevControlX;
            var firstControlY = prevControlY;
            it("should calculate new render control points", function () {
                //TODO:
                assert.strictEqual(firstStartX, firstExpectedStartX);
                assert.strictEqual(firstStartY, firstExpectedStartY);
                assert.strictEqual(firstControlX, firstExpectedControlX);
                assert.strictEqual(firstControlY, firstExpectedControlY);
                assert.strictEqual(firstEndX, firstExpectedEndX);
                assert.strictEqual(firstEndY, firstExpectedEndY);
            });

            //Verify that toggling again will revert the state
            arrow.toggleDirection(rect);
            var secondDirection = arrow.getDirection();
            var secondRect = $.extend({}, rect);
            var expectedDir;
            if ($.inArray(startDirection, DIRECTIONS) !== -1) {
                expectedDir = startDirection;
            } else {
                expectedDir = "NNE"; //This assumes the default direction is NNE!
            }
            it("should revert the direction when repeated", function () {
                assert.strictEqual(secondDirection, expectedDir);
            });
            it("should revert the tip rect when repeated", function () {
                rectEquals(secondRect, tipRect.top, tipRect.left, tipRect.width, tipRect.height);
            });

            pt = getExpectedStartPt(secondRect, options, secondDirection);
            var secondExpectedStartX = pt.x;
            var secondExpectedStartY = pt.y;
            pt = getExpectedEndPt(rect, options, secondDirection);
            var secondExpectedEndX = pt.x;
            var secondExpectedEndY = pt.y;
            pt = getExpectedControlPt(secondExpectedStartX, secondExpectedStartY, secondExpectedEndX, secondExpectedEndY, secondDirection);
            var secondExpectedControlX = pt.x;
            var secondExpectedControlY = pt.y;

            arrow.render();
            var secondStartX = prevStartX;
            var secondStartY = prevStartY;
            var secondEndX = prevEndX;
            var secondEndY = prevEndY;
            var secondControlX = prevControlX;
            var secondControlY = prevControlY;

            it("should revert the render control points when repeated", function () {
                assert.strictEqual(secondStartX, secondExpectedStartX);
                assert.strictEqual(secondStartY, secondExpectedStartY);
                assert.strictEqual(secondControlX, secondExpectedControlX);
                assert.strictEqual(secondControlY, secondExpectedControlY);
                assert.strictEqual(secondEndX, secondExpectedEndX);
                assert.strictEqual(secondEndY, secondExpectedEndY);
            });
        });
    };

    describe("$.tutorialOverlay.createArrow()", function () {
        var arrow = $.tutorialOverlay.createArrow(tipRect, arrowOptions);
        it("should create an Arrow with the correct padding", function () {
            assert.strictEqual(arrow.getPadding(), arrowOptions.padding);
        });
        it("should create an Arrow with the correct size", function () {
            assert.strictEqual(arrow.getSize(), arrowOptions.size);
        });
        it("should create an Arrow with the correct direction", function () {
            assert.strictEqual(arrow.getDirection(), arrowOptions.direction);
        });

        var testCalculatedPoints = function (direction) {
            it("direction should calculate arrow points correctly", function () {
                testPoints(direction);
            });
        };

        for (var i = 0; i < DIRECTIONS.length; i++) {
            testCalculatedPoints(DIRECTIONS[i]);
        }

        it("Invalid direction should calculate arrow points correctly for a default", function () {
            testPoints("invalid");
        });
        it("Undefined direction should calculate arrow points correctly for a default", function () {
            testPoints();
        });
    });

    describe("$.tutorialOverlay.toggleDirection()", function () {
        testToggle("NNE", "NNW", {
            top: tipRect.top,
            left: tipRect.left + arrowOptions.size,
            width: tipRect.width,
            height: tipRect.height
        });
        testToggle("NNW", "NNE", {
            top: tipRect.top,
            left: tipRect.left - arrowOptions.size,
            width: tipRect.width,
            height: tipRect.height
        });
        testToggle("SSE", "SSW", {
            top: tipRect.top,
            left: tipRect.left + arrowOptions.size,
            width: tipRect.width,
            height: tipRect.height
        });
        testToggle("SSW", "SSE", {
            top: tipRect.top,
            left: tipRect.left - arrowOptions.size,
            width: tipRect.width,
            height: tipRect.height
        });
        testToggle("WSW", "WNW", {
            top: tipRect.top + arrowOptions.size,
            left: tipRect.left,
            width: tipRect.width,
            height: tipRect.height
        });
        testToggle("WNW", "WSW", {
            top: tipRect.top - arrowOptions.size,
            left: tipRect.left,
            width: tipRect.width,
            height: tipRect.height
        });
        testToggle("ESE", "ENE", {
            top: tipRect.top + arrowOptions.size,
            left: tipRect.left,
            width: tipRect.width,
            height: tipRect.height
        });
        testToggle("ENE", "ESE", {
            top: tipRect.top - arrowOptions.size,
            left: tipRect.left,
            width: tipRect.width,
            height: tipRect.height
        });
        testToggle("Invalid", "NNW", {
            top: tipRect.top,
            left: tipRect.left + arrowOptions.size,
            width: tipRect.width,
            height: tipRect.height
        });
        testToggle(undefined, "NNW", {
            top: tipRect.top,
            left: tipRect.left + arrowOptions.size,
            width: tipRect.width,
            height: tipRect.height
        });
    });

    describe("$.tutorialOverlay.isValid()", function () {
        var rect = $.extend({}, tipRect);
        var options = $.extend({}, arrowOptions);

        var startX, startY, endX, endY, controlX, controlY;
        options.drawFn = function (canvasContext, options) {
            startX = options.startX;
            startY = options.startY;
            endX = options.endX;
            endY = options.endY;
            controlX = options.controlX;
            controlY = options.controlY;
        };

        var testValid = function () {
            var arrow = $.tutorialOverlay.createArrow(rect, options);
            arrow.render();

            var testRect, r;
            var validRects = [];
            var invalidRects = [];
            var size = arrow.getSize();
            var padding = 1;
            if (controlX < endX) {
                //Arrow points right
                //Calculate a rectangle that covers the valid target range
                testRect = {
                    top: endY - (size / 2),
                    left: endX,
                    width: size,
                    height: size
                };
                //Calculate some valid target rects
                validRects.push(testRect);
                r = $.extend({}, testRect);
                r.top = endY;
                validRects.push(r);
                r = $.extend({}, testRect);
                r.top = endY - r.height;
                validRects.push(r);

                //Calculate some invalid target rects
                r = $.extend({}, testRect);
                r.top = endY - (r.height + padding);
                invalidRects.push(r);
                r = $.extend({}, testRect);
                r.top = endY + padding;
                invalidRects.push(r);
                r = $.extend({}, testRect);
                r.top = 0;
                r.height = Number.MAX_VALUE;
                r.left = endX - padding;
                invalidRects.push(r);
            } else if (controlX > endX) {
                //Arrow points left
                //Calculate a rectangle that covers the valid target range
                testRect = {
                    top: endY - (size / 2),
                    left: endX - size,
                    width: size,
                    height: size
                };
                //Calculate some valid target rects
                validRects.push(testRect);
                r = $.extend({}, testRect);
                r.top = endY;
                validRects.push(r);
                r = $.extend({}, testRect);
                r.top = endY - r.height;
                validRects.push(r);

                //Calculate some invalid target rects
                r = $.extend({}, testRect);
                r.top = endY - (r.height + padding);
                invalidRects.push(r);
                r = $.extend({}, testRect);
                r.top = endY + padding;
                invalidRects.push(r);
                r = $.extend({}, testRect);
                r.top = 0;
                r.height = Number.MAX_VALUE;
                r.left = endX + padding;
                invalidRects.push(r);
            } else if (controlY < endY) {
                //Arrow points down
                //Calculate a rectangle that covers the valid target range
                testRect = {
                    top: endY,
                    left: endX - (size / 2),
                    width: size,
                    height: size
                };
                //Calculate some valid target rects
                validRects.push(testRect);
                r = $.extend({}, testRect);
                r.left = endX;
                validRects.push(r);
                r = $.extend({}, testRect);
                r.left = endX - r.width;
                validRects.push(r);

                //Calculate some invalid target rects
                r = $.extend({}, testRect);
                r.left = endX - (r.width + padding);
                invalidRects.push(r);
                r = $.extend({}, testRect);
                r.left = endX + padding;
                invalidRects.push(r);
                r = $.extend({}, testRect);
                r.left = 0;
                r.width = Number.MAX_VALUE;
                r.top = endY - padding;
                invalidRects.push(r);
            } else if (controlY > endY) {
                //Arrow points up
                //Calculate a rectangle that covers the valid target range
                testRect = {
                    top: endY - size,
                    left: endX - (size / 2),
                    width: size,
                    height: size
                };
                //Calculate some valid target rects
                validRects.push(testRect);
                r = $.extend({}, testRect);
                r.left = endX;
                validRects.push(r);
                r = $.extend({}, testRect);
                r.left = endX - r.width;
                validRects.push(r);

                //Calculate some invalid target rects
                r = $.extend({}, testRect);
                r.left = endX - (r.width + padding);
                invalidRects.push(r);
                r = $.extend({}, testRect);
                r.left = endX + padding;
                invalidRects.push(r);
                r = $.extend({}, testRect);
                r.left = 0;
                r.width = Number.MAX_VALUE;
                r.top = endY - padding;
                invalidRects.push(r);
            } else {
                assert.assert((controlX != endX) || (controlY != endY), "controlPt should never be equal to the endPt");
            }

            var testValidRect = function (validRect) {
                it("should be valid for calculated target rect", function () {
                    assert(arrow.isValid(validRect), "valid rectangle was declared invalid");
                });
            };
            var testInvalidRect = function (invalidRect) {
                it("should be invalid for calculated target rect", function () {
                    assert(!arrow.isValid(invalidRect), "invalid rectangle was declared valid");
                });
            };
            validRects.forEach(testValidRect);
            invalidRects.forEach(testInvalidRect);
        };
        for (var i = 0; i < DIRECTIONS.length; i++) {
            options.direction = DIRECTIONS[i];
            describe(options.direction, testValid);
        }
    });
});