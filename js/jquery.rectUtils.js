/*
Utility functions for rectangle math.
*/
(function ($) {
    $.rectsIntersect = function (rect1, rect2) {
        return !(rect2.left > rect1.right ||
            rect2.right < rect1.left ||
            rect2.top > rect1.bottom ||
            rect2.bottom < rect1.top);
    };

    $.translateRect = function (rect, dx, dy) {
        rect.left += dx;
        rect.top += dy;
        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;
    };

    $.growRect = function (rect, dw, dh) {
        if ((typeof (dh) === "undefined") || isNaN(dh)) {
            dh = dw;
        }
        rect.width += dw;
        rect.height += dh;
        $.translateRect(rect, -dw / 2, -dh / 2);
    };

    $.addPointToRect = function (x, y, rect) {
        if (x < rect.left) {
            rect.left = x;
            rect.width = rect.right - rect.left;
        } else if (x > rect.right) {
            rect.right = x;
            rect.width = rect.right - rect.left;
        }
        if (y < rect.top) {
            rect.top = y;
            rect.height = rect.bottom - rect.top;
        } else if (y > rect.bottom) {
            rect.bottom = y;
            rect.height = rect.bottom - rect.top;
        }
    };
})(jQuery);