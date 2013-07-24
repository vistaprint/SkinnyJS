// ## jQuery.clientRect

// Returns a rectangle object containing the height, width, top, left, bottom, and right coordinates 
// for a given element relative to the document.

// Highly performant, and cross browser.

// Note: jQuery's jQuery.height()/width() methods are inefficient (read: wicked slow) for two reasons:

// 1. They don't use [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/element.getBoundingClientRect), 
// which gets a DOM element's coordinates directly from the render tree, and is much faster than reading CSS properties 
// and having to calculate offsets from parent elements by walking the DOM. All modern browsers support getBoundingClientRect.
// 2. Even if they did use it, the API requires two separate calls to get height/width, which makes it inherently twice as slow.
// jQuery.clientRect() can be orders of magnitude more performant (depending on the size and complexity of the DOM).

// ### Usage

//     var rect = $(".something").clientRect();

// ### Source

(function($)
{

// Expose support flag. Aids in unit testing.
$.support.getBoundingClientRect = "getBoundingClientRect" in document.documentElement;

// Gets the window containing the specified element.
function getWindow(elem) 
{
    return $.isWindow(elem) ?
        elem :
        elem.nodeType === 9 ?
            elem.defaultView || elem.parentWindow :
            false;
}

// Returns a rect for the first element in the jQuery object.
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
    var box;

    // Make sure we're not dealing with a disconnected DOM node
    if (!$.contains(docElem, elem))
    {
        return rect;
    }

    // Make modern browsers wicked fast
    if ($.support.getBoundingClientRect)
    {
        // This is derived from the internals of jQuery.fn.offset
        try 
        {
            box = elem.getBoundingClientRect();
        } 
        catch(e) 
        {
            // OldIE throws an exception when trying to get a client rect for an element
            // that hasn't been rendered, or isn't in the DOM.
            // For consistency, return a 0 rect.
        }
        
        if (!box) 
        {
            return rect;
        }

        // TODO needs a unit test to verify the returned rect always has the same properties (i.e. bottom, right)
        // If the rect has no area, it needs no further processing
        if (box.right === box.left &&
            box.top === box.bottom)
        {
            return rect;
        }

        // Handles some quirks in the oldIE box model, including some bizarre behavior around the starting coordinates.
        var body = doc.body,
            win = getWindow( doc ),
            clientTop  = docElem.clientTop  || body.clientTop  || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
            scrollTop  = win.pageYOffset || $.support.boxModel && docElem.scrollTop  || body.scrollTop,
            scrollLeft = win.pageXOffset || $.support.boxModel && docElem.scrollLeft || body.scrollLeft;

        rect.top  = box.top  + (scrollTop  - clientTop);
        rect.left = box.left + (scrollLeft - clientLeft);

        rect.width = box.right - box.left;
        rect.height = box.bottom - box.top;
    }
    else
    {   
        // Support ancient browsers by falling back to jQuery.innerWidth/Height()
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