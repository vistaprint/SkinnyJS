/*jsl:option explicit*/
/// <reference path="../jquery-current.js" />

(function($)
{
    var DOCUMENT_NODE = 9;

    // Gets a jQuery object containing the iframe element containing the current content
    $.fn.hostIframe = function()
    {
        return this.map(function(index, doc)
        {
            if (!doc.nodeType == DOCUMENT_NODE)
            {
                throw new Error("Element is not a document");
            }

            var win = doc.defaultView ? doc.defaultView : doc.parentWindow;

            try
            {
                if (win && win.frameElement)
                {
                    return win.frameElement;
                }
            }
            catch (e)
            {
                // accessing win.frameElement might fail if iframe is cross-site
            }

            return null;
        });
    };

    // If the current jQuery object contains an iframe, this gets a jQuery object containing the iframe's document
    $.fn.iframeDocument = function()
    {
        return this.map(function(index, iframe)
        {
            try
            {
                return iframe.contentWindow.document;
            }
            catch (ex)
            {
                return null;
            }
        });
    };

    // If the current jQuery object contains an iframe, this gets a jQuery object containing the iframe's content window
    $.fn.iframeWindow = function()
    {
        return this.map(function(index, iframe)
        {
            return iframe.contentWindow;
        });
    };
    
})(jQuery);