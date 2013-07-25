/// <reference path="jquery.delimitedString.js" />

// ## jQuery.queryString
// Parses querystrings. For example, the following querystring:

//     "name=John&address=1%202%20West%20St&phone=(123)%20123-1234"

// can be transformed into a JavaScript object:

//     {
//         "name": "John",
//         "address": "12 West St",
//         "phone": "(123) 123-1234"
//     }

// This is the inverse of [jQuery.param()](http://api.jquery.com/jQuery.param/)

// ### Usage

// #### $.deparam(queryString)
// Parse a querystring to a JavaScript object:

//     var qs = $.deparam("icecream=vanilla&brownie=chocolate");
//     qs.brownie === "chocolate";  // true

// #### $.currentQueryString()
// Get the querystring from the current document.location as a parsed object:

//     // Current document.location: http://www.foo.com?icecream=vanilla&brownie=chocolate
//     var qs = $.currentQueryString();
//     qs.icecream === "vanilla"; // true

// #### $.appendQueryString(url, parsedQueryString)
// There's also a method to append a parsed querystring to a URL:

//     var url = $.appendQueryString("http://www.foo.com", { "icecream": "vanilla", "brownie": "chocolate"});
//     url === "http://www.foo.com?icecream=vanilla&brownie=chocolate";  // true

// ### Dependencies
// This library uses jquery.delimitedString (part of skinny.js), which abstracts encoding/decoding of key-value pairs.

// ### Source

(function($)
{
    var PLUS_RE = /\+/gi;

    var urlDecode = function(s)
    {
        // Replace plus with space- jQuery.param() explicitly encodes them,
        // and decodeURIComponent explicitly does not.
        return decodeURIComponent(s.replace(PLUS_RE, " "));
    };

    // Given a querystring (as a string), deserializes it to a javascript object.
    $.deparam = function(queryString)
    {
        if (typeof queryString != "string")
        {
            throw new Error("$.deparam() expects a string for 'queryString' argument.");
        }

        // Remove "?", which starts querystrings
        if (queryString && queryString.charAt(0) == "?")
        {
            queryString = queryString.substring(1, queryString.length);
        }

        return $.parseDelimitedString(queryString, "&", "=", urlDecode);
    };

    // Alias
    $.parseQueryString = $.deparam;

    // Gets the querystring from the current document.location as a javascript object.
    $.currentQueryString = function()
    {
        return $.deparam(window.location.search);
    };

    // Given a url (pathname) and an object representing a querystring, constructs a full URL
    $.appendQueryString = function(url, parsedQueryString)
    {
        var qs = $.param(parsedQueryString);
        if (qs.length > 0)
        {
            qs = "?" + qs;
        }

        return url + qs;
    };
    
})(jQuery);