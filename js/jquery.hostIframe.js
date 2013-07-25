// ## jQuery.hostIframe
// This plugin provides methods to get references to the host iframe element from within the iframe, 
// and to get a window/document reference for a specified iframe.

// ### Usage

// #### jQuery.fn.hostIframe()
// From a document within an iframe, you can get a jQuery object containing the iframe:

//     var $iframe = $(document).hostIframe();

// This may be useful if you want information about the iframe, e.g. the dimensions:

//     var width = $(document).hostIframe().width();

// #### jQuery.fn.iframeDocument()
// You can get a reference from the iframe element to the document inside it:

//     // Get the URL of the iframe's document, which may be different from that of the iframe's src property
//     var iframeUrl = $("iframe").iframeDocument()[0].location.href

// #### jQuery.fn.iframeWindow()
// You can get a reference from the iframe element to the window inside it:

//     // Post a message to the iframe's window using skinny.js's $.postMessage() plugin
//     $("iframe").iframeWindow().postMessage("hi there", "http://www.foo.com");

// ### Source

(function($)
{
    var DOCUMENT_NODE = 9;

    // Gets a jQuery object containing the iframe element containing the current content
    $.fn.hostIframe = function()
    {
        return this.map(function(index, doc)
        {
            // TODO make this work for windows too
            if (doc.nodeType != DOCUMENT_NODE)
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