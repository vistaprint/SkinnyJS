describe("jquery.tutorialOverlay.Arrow", function () {
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

    /**
     * Create an Arrow decorated with a getPoints() function that returns the start, control, and end points (as well as headSize).
     * @param {object} rect The rectangle to use when creating the Arrow
     * @param {object} options The options to use when creating the Arrow
     * @returns {Arrow} an Arrow with a getPoints() function
     */
    var createTestArrow = function (rect, options) {
        var _startPt, _endPt, _controlPt, _headSize;

        var _drawFn = function (canvasContext, options) {
            _startPt = {
                x: options.startX,
                y: options.startY
            };
            _endPt = {
                x: options.endX,
                y: options.endY
            };
            _controlPt = {
                x: options.controlX,
                y: options.controlY
            };
            _headSize = options.headSize;
        };

        options.drawFn = _drawFn;
        var arrow = $.tutorialOverlay.createArrow(rect, options);
        arrow.getPoints = function () {
            arrow.render();
            return {
                start: _startPt,
                end: _endPt,
                control: _controlPt,
                headSize: _headSize
            };
        };
        return arrow;
    };

    describe("$.tutorialOverlay.createArrow", function () {
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

            var arrow = createTestArrow(rect, options);
            var points = arrow.getPoints();
            assert.strictEqual(points.start.x, expectedStartX);
            assert.strictEqual(points.start.y, expectedStartY);
            assert.strictEqual(points.control.x, expectedControlX);
            assert.strictEqual(points.control.y, expectedControlY);
            assert.strictEqual(points.end.x, expectedEndX);
            assert.strictEqual(points.end.y, expectedEndY);
            assert.strictEqual(points.headSize, arrowOptions.headSize);
        };

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

    describe("#.toggleDirection", function () {
        var testToggle = function (startDirection, toggledDirection, expectedTipRect) {
            var rect = $.extend({}, tipRect);
            var options = $.extend({}, arrowOptions);
            options.direction = startDirection;

            var arrow = createTestArrow(rect, options);

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
                var points = arrow.getPoints();

                var firstStartX = points.start.x;
                var firstStartY = points.start.y;
                var firstEndX = points.end.x;
                var firstEndY = points.end.y;
                var firstControlX = points.control.x;
                var firstControlY = points.control.y;
                it("should calculate new render control points", function () {
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

                points = arrow.getPoints();
                var secondStartX = points.start.x;
                var secondStartY = points.start.y;
                var secondEndX = points.end.x;
                var secondEndY = points.end.y;
                var secondControlX = points.control.x;
                var secondControlY = points.control.y;

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

    describe("#.isValid", function () {
        var rect = $.extend({}, tipRect);
        var options = $.extend({}, arrowOptions);

        var testValid = function () {
            var arrow = createTestArrow(rect, options);
            var points = arrow.getPoints();
            var endX = points.end.x;
            var endY = points.end.y;
            var controlX = points.control.x;
            var controlY = points.control.y;

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

    describe("#.addToTip", function () {
        //create Arrow
        var options = $.extend({}, arrowOptions);

        var testAddToTip = function (direction) {
            //create tipRect
            var rect = $.extend({}, tipRect);
            options.direction = direction;
            var arrow = createTestArrow(rect, options);
            var points = arrow.getPoints();
            var startX = points.start.x;
            var startY = points.start.y;
            var endX = points.end.x;
            var endY = points.end.y;
            var controlX = points.control.x;
            var controlY = points.control.y;

            //invoke addToTip
            arrow.addToTip(rect);

            //assert the tipRect now contains the Arrow rect
            var arrowRect = {
                top: Math.min(startY, endY, controlY),
                left: Math.min(startX, endX, controlX)
            };
            arrowRect.width = Math.max(startX, endX, controlX) - arrowRect.left;
            arrowRect.height = Math.max(startY, endY, controlY) - arrowRect.top;
            var expectedLeft = Math.min(tipRect.left, arrowRect.left);
            var expectedTop = Math.min(tipRect.top, arrowRect.top);
            var expectedRight = Math.max(tipRect.left + tipRect.width, arrowRect.left + arrowRect.width);
            var expectedBottom = Math.max(tipRect.top + tipRect.height, arrowRect.top + arrowRect.height);

            it("should calculate the correct union of " + direction + " Arrow and Tip", function () {
                rectEquals(rect, expectedTop, expectedLeft, expectedRight - expectedLeft, expectedBottom - expectedTop);
            });
        };
        DIRECTIONS.forEach(testAddToTip);
    });

    describe("#.translate", function () {
        //create tipRect
        var rect = $.extend({}, tipRect);
        //create Arrow options
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

        var testTranslate = function (dx, dy) {
            it("should move the Arrow " + dx + ", " + dy, function () {
                //Create arrow
                var arrow = createTestArrow(rect, options);
                var points = arrow.getPoints();
                var originalStartX = points.start.x;
                var originalStartY = points.start.y;
                var originalEndX = points.end.x;
                var originalEndY = points.end.y;
                var originalControlX = points.control.x;
                var originalControlY = points.control.y;

                //Move the arrow
                arrow.translate(dx, dy);
                points = arrow.getPoints();

                assert.strictEqual(points.start.x, originalStartX + dx);
                assert.strictEqual(points.start.y, originalStartY + dy);
                assert.strictEqual(points.end.x, originalEndX + dx);
                assert.strictEqual(points.end.y, originalEndY + dy);
                assert.strictEqual(points.control.x, originalControlX + dx);
                assert.strictEqual(points.control.y, originalControlY + dy);
            });
        };

        testTranslate(10, 10);
        testTranslate(10, -10);
        testTranslate(-10, 10);
        testTranslate(-10, -10);
        testTranslate(0, 0);
    });

    describe("#.render", function () {
        //create tipRect
        var rect = $.extend({}, tipRect);
        //create Arrow options
        var options = $.extend({}, arrowOptions);

        var testHeadSize = options.headSize;
        var testColor = "somecolor";
        var testCanvasContext = "somecanvascontext";
        options.drawFn = function (canvasContext, options) {
            assert.strictEqual(canvasContext, testCanvasContext);
            assert.strictEqual(options.color, testColor);
            assert.strictEqual(options.headSize, testHeadSize);
        };
        it("should invoke the custom drawing function with expected parameters", function () {
            var arrow = $.tutorialOverlay.createArrow(rect, options);
            arrow.render(testColor, testCanvasContext);
        });
    });


});