/*
Utility functions for rectangle math.
*/
(function ($) {
    $.rectsIntersect = function (rect1, rect2) {
        return !(rect2.left > (rect1.left + rect1.width) ||
            (rect2.left + rect2.width) < rect1.left ||
            rect2.top > (rect1.top + rect1.height) ||
            (rect2.top + rect2.height) < rect1.top);
    };

    $.translateRect = function (rect, dx, dy) {
        rect.left += dx;
        rect.top += dy;
        _calculateRightBottom(rect);
        return rect;
    };

    $.growRect = function (rect, dw, dh) {
        if ((typeof (dh) === "undefined") || isNaN(dh)) {
            dh = dw;
        }
        rect.width += dw * 2;
        rect.height += dh * 2;
        return $.translateRect(rect, -dw, -dh);
    };

    $.addPointToRect = function (x, y, rect) {
        if (x < rect.left) {
            rect.width = (rect.left + rect.width) - x;
            rect.left = x;
        } else if (x > (rect.left + rect.width)) {
            rect.width = x - rect.left;
        }
        if (y < rect.top) {
            rect.height = (rect.top + rect.height) - y;
            rect.top = y;
        } else if (y > (rect.top + rect.height)) {
            rect.height = y - rect.top;
        }
        _calculateRightBottom(rect);
        return rect;
    };

    var _calculateRightBottom = function (rect) {
        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;
    };
})(jQuery);