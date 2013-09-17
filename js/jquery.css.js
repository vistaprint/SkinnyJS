/// <reference path="jquery.delimitedString.js" />

(function($)
{
    var _mapCamelToDash = {};


    // Takes a css property in object syntax (i.e. "textAlign") and converts it to CSS string syntax (i.e. "text-align")
    $.camelToDashCase = function(prop)
    {
        //Cache for performance- big win.
        var value = _mapCamelToDash[prop];
        if (!value)
        {
            value = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
            _mapCamelToDash[prop] = value;
        }
    
        return value;
    };

    var _mapDashToCamel = {};

    // Takes a css property in css syntax (i.e. "text-align") and converts it to object syntax (i.e. "textAlign")
    $.dashToCamelCase = function(sProperty)
    {
        var value = _mapDashToCamel[sProperty];

        //Cache for performance: big win
        if (!value)
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
        
                value = aOut.join("");
            }
            else
            {
                value = sProperty;
            }

            _mapDashToCamel[sProperty] = value;
        }
    
        return value;
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