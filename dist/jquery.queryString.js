/// <reference path="jquery.delimitedString.js" />

(function ($) {
    var PLUS_RE = /\+/gi;

    var urlDecode = function (s) {
        // Specifically treat null/undefined as empty string
        if (s == null) {
            return "";
        }

        // Replace plus with space- jQuery.param() explicitly encodes them,
        // and decodeURIComponent explicitly does not.
        return decodeURIComponent(s.replace(PLUS_RE, " "));
    };

    // Given a querystring (as a string), deserializes it to a javascript object.
    $.deparam = function (queryString) {
        if (typeof queryString != "string") {
            throw new Error("$.deparam() expects a string for 'queryString' argument.");
        }

        // Remove "?", which starts querystrings
        if (queryString && queryString.charAt(0) == "?") {
            queryString = queryString.substring(1, queryString.length);
        }

        return $.parseDelimitedString(queryString, "&", "=", urlDecode);
    };

    // Alias
    $.parseQueryString = $.deparam;

    // Gets the querystring from the current document.location as a javascript object.
    $.currentQueryString = function () {
        return $.deparam(window.location.search);
    };

    // Given a url (pathname) and an object representing a querystring, constructs a full URL
    $.appendQueryString = function (url, parsedQueryString) {
        var qs = $.param(parsedQueryString);
        if (qs.length > 0) {
            qs = "?" + qs;
        }

        return url + qs;
    };

})(jQuery);
