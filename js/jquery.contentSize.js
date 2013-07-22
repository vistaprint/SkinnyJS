/// <reference path="jquery.clientRect.js" />

(function($)
{

var isQuirksMode = function()
{
    if (!document.all)
    {
        return false;
    }
    
    return document.compatMode != "CSS1Compat";
};

var addMargin = function(node, styleProp, rectProp, rect)
{
    var margin = parseInt($(node).css(styleProp), 10);
    if (margin)
    {
        rect[rectProp] += margin;
    }
};

// size gets continuously populated as this recurses through the DOM, building the max size of the page.
var gatherSize = function(size, node, includeChildrenOnly, includeWidth, includeHeight)
{
    var rect;

    // Only look at elements
    if (node.nodeType != 1)
    {
        return;
    }

    if (!includeChildrenOnly)
    {
        try
        {
            rect = $(node).clientRect();
        }
        catch (ex)
        {
            return;  //Couldn't get the size, so let's just return.
        }

        //if the node is not rendered, don't factor in its size
        if (rect.height === 0 && rect.width === 0)
        {
            return;
        }

        if (node.tagName == "BODY")
        {
            addMargin(node, "marginRight", "right", rect);
            addMargin(node, "marginBottom", "bottom", rect);
        }

        if (includeHeight)
        {
            size.height = Math.max(rect.bottom, size.height);
        }
        
        if (includeWidth)
        {
            size.width = Math.max(rect.right, size.width);
        }

        //If the node is a vertical scrolling container, don't look at its children for the purposes of calculating height
        if ($(node).css("overflowX") != "visible" && 
            ($(node).css("height") != "auto" || $(node).css("maxHeight") != "none"))
        {
            includeHeight = false;
        }

        //If the node is a horizontal scrolling container, don't look at its children for the purposes of calculating width
        if ($(node).css("overflowY") != "visible" && 
            ($(node).css("width") != "auto" || $(node).css("maxWidth") != "none"))
        {
            includeWidth = false;
        }

        //optimization- if we don't need to measure any children, stop recursing.
        if (!includeHeight && !includeWidth)
        {
            return;
        }
    }

    //Recurse
    if (node.tagName !== "OBJECT")
    {
        var len = node.childNodes.length;
        for (var i = 0; i < len; i++)
        {
            gatherSize(size, node.childNodes[i], false, includeWidth, includeHeight);
        }
    }
};

/**
 * Measures the document content using a more accurate approach relying on body.scrollHeight
 * especially when used in an iframe.
 * Returns the height and width of the total page: the total scrolling size.
 * @return {vp.ISize}
 */
$.fn.contentSize = function(excludeScrollbars)
{
    var el = this[0];
    
    if (!el)
    {
        throw new Error("Element required");
    }

    // If el is a window or a document, pay attention to excludeScrollbars
    // doc will be null if el is not a window or document
    var doc = el.document || (el.documentElement ? el : (el.tagName == "BODY" ? el.ownerDocument : null));

    //Exclude scrollbars- browsers don't offer any way to ignore the scrollbar
    //when calculating content dimensions, so just hide/restore

    var currentOverflow;
    if (excludeScrollbars && doc)
    {
        currentOverflow = doc.documentElement.style.overflow;
        doc.documentElement.style.overflow = "hidden";
    }

    var size = { width:0, height:0 };
    var startingNode = doc ? doc.body : el;
    var includeChildrenOnly = false;

    if (startingNode.tagName == "BODY")
    {
        includeChildrenOnly = true;
    }

    gatherSize(size, doc ? doc.body : el, includeChildrenOnly, true, true);
    
    if (excludeScrollbars && doc)
    {
        doc.documentElement.style.overflow = currentOverflow;
    }

    return size;
};

})(jQuery);
