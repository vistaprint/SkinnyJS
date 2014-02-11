describe("jquery.rectUtils", function () {
    var assert = chai.assert;

    var rect = {
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

    describe("$.rectsIntersect()", function () {
        it("should detect when two rectangles overlap in the northwest/southeast corners", function () {
            var rect2 = {
                top: 10,
                left: 10,
                width: 100,
                height: 100
            };

            assert($.rectsIntersect(rect, rect2), "NW corner of rect intersects SE corner of rect2");
            assert($.rectsIntersect(rect2, rect), "SE corner of rect2 intersects NW corner of rect");
        });

        it("should detect when two rectangles overlap in the northeast/southwest corners", function () {
            var rect2 = {
                top: 10,
                left: 190,
                width: 100,
                height: 100
            };

            assert($.rectsIntersect(rect, rect2), "NE corner of rect intersects SW corner of rect2");
            assert($.rectsIntersect(rect2, rect), "SW corner of rect2 intersects NE corner of rect");
        });

        it("should detect when two rectangles overlap in the southeast/northwest corners", function () {
            var rect2 = {
                top: 190,
                left: 190,
                width: 100,
                height: 100
            };

            assert($.rectsIntersect(rect, rect2), "SE corner of rect intersects NW corner of rect2");
            assert($.rectsIntersect(rect2, rect), "NW corner of rect2 intersects SE corner of rect");
        });

        it("should detect when two rectangles overlap in the southwest/northeast corners", function () {
            var rect2 = {
                top: 190,
                left: 10,
                width: 100,
                height: 100
            };

            assert($.rectsIntersect(rect, rect2), "SW corner of rect intersects NE corner of rect2");
            assert($.rectsIntersect(rect2, rect), "NE corner of rect2 intersects SW corner of rect");
        });

        it("should detect when the second rectangle contains the first", function () {
            var rect2 = {
                top: 10,
                left: 10,
                width: 200,
                height: 200
            };

            assert($.rectsIntersect(rect, rect2), "rect is contained within rect2");
            assert($.rectsIntersect(rect2, rect), "rect2 contains rect");
        });

        it("should detect when the first rectangle contains the second", function () {
            var rect2 = {
                top: 110,
                left: 110,
                width: 80,
                height: 80
            };

            assert($.rectsIntersect(rect, rect2), "rect contains rect1");
            assert($.rectsIntersect(rect2, rect), "rect2 is contained within rect");
        });

        it("should detect when two rectangles do not overlap", function () {
            var rect2 = {
                top: 110,
                left: 110,
                width: 100,
                height: 100
            };

            assert($.rectsIntersect(rect, rect2), "rect does not intersect rect2");
            assert($.rectsIntersect(rect2, rect), "rect2 does not intersect rect");
        });
    });

    describe("$.translateRect()", function () {
        it("should move the rectangle exactly as specified", function () {
            //Use a copy of rect for testing
            var testRect = $.extend({}, rect);
            var dx = 10;
            var dy = 15;
            $.translateRect(testRect, dx, dy);

            rectEquals(testRect, rect.top + dy, rect.left + dx, rect.width, rect.height);
        });
    });

    describe("$.growRect()", function () {
        it("should change the size of the rectangle without moving the center", function () {
            //Use a copy of rect for testing
            var testRect = $.extend({}, rect);
            var dw = 10;
            var dh = 15;
            $.growRect(testRect, dw, dh);

            rectEquals(testRect, rect.top - dh, rect.left - dw, rect.width + dw + dw, rect.height + dh + dh);
        });
        it("should shrink the size of the rectangle without moving the center", function () {
            //Use a copy of rect for testing
            var testRect = $.extend({}, rect);
            var dw = -10;
            var dh = -15;
            $.growRect(testRect, dw, dh);

            rectEquals(testRect, rect.top - dh, rect.left - dw, rect.width + dw + dw, rect.height + dh + dh);
        });
        it("should treat the last parameter as optional", function () {
            //Use a copy of rect for testing
            var testRect = $.extend({}, rect);
            var dw = -10;
            $.growRect(testRect, dw);

            rectEquals(testRect, rect.top - dw, rect.left - dw, rect.width + dw + dw, rect.height + dw + dw);
        });
    });

    describe("$.addPointToRect()", function () {
        it("should correctly adjust rectangle to include point to the NW", function () {
            var testRect = $.extend({}, rect);
            var dx = 10;
            var dy = 15;
            var x = testRect.left - dx;
            var y = testRect.top - dy;
            $.addPointToRect(x, y, testRect);

            rectEquals(testRect, Math.min(rect.top, y), Math.min(rect.left, x), rect.width + dx, rect.height + dy);
        });

        it("should correctly adjust rectangle to include point to the NE", function () {
            var testRect = $.extend({}, rect);
            var dx = 10;
            var dy = 15;
            var x = testRect.left + testRect.width + dx;
            var y = testRect.top - dy;
            $.addPointToRect(x, y, testRect);

            rectEquals(testRect, Math.min(rect.top, y), Math.min(rect.left, x), rect.width + dx, rect.height + dy);
        });

        it("should correctly adjust rectangle to include point to the SE", function () {
            var testRect = $.extend({}, rect);
            var dx = 10;
            var dy = 15;
            var x = testRect.left + testRect.width + dx;
            var y = testRect.top + testRect.height + dy;
            $.addPointToRect(x, y, testRect);

            rectEquals(testRect, Math.min(rect.top, y), Math.min(rect.left, x), rect.width + dx, rect.height + dy);
        });

        it("should correctly adjust rectangle to include point to the SW", function () {
            var testRect = $.extend({}, rect);
            var dx = 10;
            var dy = 15;
            var x = testRect.left - dx;
            var y = testRect.top + testRect.height + dy;
            $.addPointToRect(x, y, testRect);

            rectEquals(testRect, Math.min(rect.top, y), Math.min(rect.left, x), rect.width + dx, rect.height + dy);
        });

        it("should not change the rectangle if it already contains the point", function () {
            var testRect = $.extend({}, rect);
            var dx = 10;
            var dy = 15;
            var x = testRect.left + dx;
            var y = testRect.top + dy;
            $.addPointToRect(x, y, testRect);

            rectEquals(testRect, rect.top, rect.left, rect.width, rect.height);
        });
    });
});