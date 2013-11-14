(function ($) {

    // Expose support flag. Aids in unit testing.
    $.support.getBoundingClientRect = "getBoundingClientRect" in document.documentElement;

    // Gets the window containing the specified element.
    function getWindow(elem) {
        return $.isWindow(elem) ?
            elem :
            elem.nodeType === 9 ?
            elem.defaultView || elem.parentWindow :
            false;
    }

    // Returns a rect for the first element in the jQuery object.
    $.fn.clientRect = function () {
        var rect = {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            bottom: 0,
            right: 0
        };

        var elem = this[0];
        var doc = elem.ownerDocument;
        var docElem = doc.documentElement;
        var box;

        // Make sure we're not dealing with a disconnected DOM node
        if (!$.contains(docElem, elem)) {
            return rect;
        }

        // Make modern browsers wicked fast
        if ($.support.getBoundingClientRect) {
            // This is derived from the internals of jQuery.fn.offset
            try {
                box = elem.getBoundingClientRect();
            } catch (e) {
                // OldIE throws an exception when trying to get a client rect for an element
                // that hasn't been rendered, or isn't in the DOM.
                // For consistency, return a 0 rect.
            }

            if (!box) {
                return rect;
            }

            // TODO needs a unit test to verify the returned rect always has the same properties (i.e. bottom, right)
            // If the rect has no area, it needs no further processing
            if (box.right === box.left &&
                box.top === box.bottom) {
                return rect;
            }

            // Handles some quirks in the oldIE box model, including some bizarre behavior around the starting coordinates.
            var win = getWindow(doc);

            rect.top = box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0);
            rect.left = box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0);

            rect.width = box.right - box.left;
            rect.height = box.bottom - box.top;
        } else {
            // Support ancient browsers by falling back to jQuery.outerWidth/Height()
            if (this.css("display") == "none") {
                return rect;
            }

            rect = this.offset();
            rect.width = this.outerWidth();
            rect.height = this.outerHeight();
        }

        rect.bottom = rect.top + rect.height;
        rect.right = rect.left + rect.width;

        return rect;
    };

})(jQuery);
