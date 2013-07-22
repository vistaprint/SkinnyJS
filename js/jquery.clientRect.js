/*jsl:option explicit*/
/// <reference path="../jquery-current.js" />

(function($)
{

// Expose support flag. Aids in unit testing.
$.support.getBoundingClientRect = "getBoundingClientRect" in document.documentElement;

function getWindow( elem ) {
    return $.isWindow( elem ) ?
        elem :
        elem.nodeType === 9 ?
            elem.defaultView || elem.parentWindow :
            false;
}

/**
 * Gets the rectangle measurements for a given element.
 * Highly performant, and cross browser.
 * Coordinate system is based on the browser client area, with the top left of the window being 0, 0.
 * Note: jQuery's offset and dimensions methods are inefficient due to an API that 
 *    won't give you the whole rectangle, so getBoundingClientRect() is called multiple times.
 *    That said, for cases where you're just calling this once in a while, just use jQuery.offset() and jQuery.height()/width()
 * @return {Object} A rectangle object with left, top, bottom, and right properties.
 */
$.fn.clientRect = function()
{
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

    // Make sure we're not dealing with a disconnected DOM node
    if (!$.contains( docElem, elem ))
    {
        return rect;
    }

    if ($.support.getBoundingClientRect)
    {
        try {
            box = elem.getBoundingClientRect();
        } catch(e) {}

        
        if ( !box ) {
            return rect;
        }

        if (box.right === box.left &&
            box.top == box.bottom)
        {
            return rect;
        }

        var body = doc.body,
            win = getWindow( doc ),
            clientTop  = docElem.clientTop  || body.clientTop  || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
            scrollTop  = win.pageYOffset || $.support.boxModel && docElem.scrollTop  || body.scrollTop,
            scrollLeft = win.pageXOffset || $.support.boxModel && docElem.scrollLeft || body.scrollLeft;

        rect.top  = box.top  + scrollTop  - clientTop,
        rect.left = box.left + scrollLeft - clientLeft;

        rect.width = box.right - box.left;
        rect.height = box.bottom - box.top;
    }
    else
    {   
        if (this.css("display") == "none")
        {
            return rect;
        }

        rect = this.offset();
        rect.width = this.innerWidth();
        rect.height = this.innerHeight();
    }

    rect.bottom = rect.top + rect.height;
    rect.right = rect.left + rect.width;

    return rect;
};

})(jQuery);