/// <reference path="jquery.delimitedString.js" />

// ## jQuery.css
// Parses/encodes CSS strings. For example, the following CSS string:

//     "background-color:red; width:25px; border-left: 1px black solid;

// can be transformed into a JavaScript object:

//     {
//         "backgroundColor": "red",
//         "width": "25px",
//         "borderLeft": "1px black solid"
//     }

// or vice-versa.

// ### Usage

// Parse a CSS string to a JavaScript object:

//     var parsed = $.parseCssString("color: blue; padding-top: 3px");
//     parsed.paddingTop === "3px";  // true

// Encode a JavaScript object as a CSS string:

//     var encoded = $.encodeCssString({ color: "blue", paddingTop: "3px" });
//     encoded === "color:blue;padding-top:3px";  // true

// Transform camel-cased CSS properties (for JavaScript) to dash case (for CSS):

//     var dashCased = $.camelToDashCase("paddingTop");
//     dashCased === "padding-top";  // true

// Transform dash case (for CSS) to camel-cased CSS properties (for JavaScript):

//     var camelCased = $.dashToCamelCase("padding-top");
//     camelCased === "paddingTop";  // true

// ### Dependencies
// This library uses jquery.delimitedString (part of skinny.js), which abstracts encoding/decoding of key-value pairs.

// ### Source

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