/// <reference path="jquery.delimitedString.js" />

// ## jQuery.contentSize

// Returns the height and width of the specified page's content: the total scrolling size.

// Measures the document content using a more accurate approach relying on body.scrollHeight,
// especially when the content is in an iframe- in which case, the body.scrollHeight always returns
// the viewport size, even if the content is smaller.

// ### Usage

//     // Gets the content width, including scrollbars
//     var rect = $(window).contentSize();
//     
//     // Gets the content width, excluding scrollbars
//     var rect = $(window).contentSize(true);
//     
//     // Works in a window inside an iframe
//     var rect = $(iframeWindow).contentSize();

// ### Source

(function($)
{
    var _mapCamelToDash = {};

    /**
    * Takes a css property in object syntax (i.e. "textAlign") and converts it to CSS string syntax (i.e. "text-align")
    * @param {string} sProperty A css property name in object syntax
    * @return {string}
    */
    $.camelToDashCase = function(prop)
    {
        //Cache for performance- big win.
        if (!_mapCamelToDash[prop])
        {
            _mapCamelToDash[prop] = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
        }
    
        return _mapCamelToDash[prop];
    };

    var _mapDashToCamel = {};

    /**
    * Takes a css property in css syntax (i.e. "text-align") and converts it to object syntax (i.e. "textAlign")
    * @param {string} sProperty A css property name in css syntax
    * @return {string}
    */
    $.dashToCamelCase = function(sProperty)
    {
        //Cache for performance: big win
        if (!_mapDashToCamel[sProperty])
        {
            if (sProperty.indexOf("-") != -1)
            {
                // convert hyphen-case to camelCase
                var aOut = [];
                for(var i = 0, len = sProperty.length;i < len; ++i) 
                {
                    var sChar = sProperty.charAt(i);
                    if (sChar == "-") 
                    {
                        i++;
                        sChar = sProperty.charAt(i).toUpperCase();
                        aOut.push(sChar);
                    } 
                    else 
                    {
                        aOut.push(sChar);
                    }
                }
        
                _mapDashToCamel[sProperty] = aOut.join("");
            }
            else
            {
                _mapDashToCamel[sProperty] = sProperty;
            }
        }
    
        return _mapDashToCamel[sProperty];
    };

    var cssKeyEncoder = function(s)
    {
        return $.trim($.camelToDashCase(s)); // trim
    };

    var cssKeyDecoder = function(s)
    {
        return $.trim($.dashToCamelCase(s)); // trim
    };

    $.encodeCssString = function(data)
    {
        return $.encodeDelimitedString(data, ";", ":", cssKeyEncoder, $.trim);
    };

    $.parseCssString = function(cssString)
    {
        return $.parseDelimitedString(cssString, ";", ":", cssKeyDecoder, $.trim);
    };

})(jQuery);