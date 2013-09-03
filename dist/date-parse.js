
// ## Date.parse

// Enhances Date.parse() to support ISO8601 and Microsoft-style dates

// Based on Colin Snover's [js-iso8601.js](https://github.com/csnover/js-iso8601)

// ### Usage
// This library provides 3 methods:

// ####Date.parse(date)
// Enhanced version of JavaScript's native Date.parse()
// If 'date' is a date in either ISO8601, [Microsoft's date format](http://msdn.microsoft.com/en-us/library/bb299886.aspx#intro_to_json_sidebarb), 
// or in any format the browser's Date.parse() implementation supports, a Date object is returned, otherwise NaN.

//     // returns a date using native Date.parse()
//     var date = Date.parse("Aug 9, 1995");
//     
//     // returns a Date, knows about ISO8601 dates
//     var date = Date.parse("2011-10-10T14:48:00");
//     
//     // returns a Date, knows about [Microsoft's date format](http://msdn.microsoft.com/en-us/library/bb299886.aspx#intro_to_json_sidebarb)
//     var date = Date.parse("\/Date(628318530718)\/");

// ####Date.parseISO8601(date)
// If 'date' is an ISO8601 date, a Date object is returned, otherwise NaN.

//     // returns NaN because the date is not ISO8601
//     var date = Date.parseISO8601("Aug 9, 1995");
//     
//     // returns a Date
//     var date = Date.parseISO8601("2011-10-10T14:48:00");

// ####Date.parseMsDate(date)
// If 'date' is a date in [Microsoft's date format](http://msdn.microsoft.com/en-us/library/bb299886.aspx#intro_to_json_sidebarb), 
// a Date object is returned, otherwise NaN.

//     // returns NaN because the date is not in Microsoft format
//     var date = Date.parseMsDate("Aug 9, 1995");
//     
//     // returns a Date
//     var date = Date.parseMsDate("\/Date(628318530718)\/");

// ### Source

(function (Date, undefined)
{
    var origParse = Date.parse, numericKeys = [1, 4, 5, 6, 7, 10, 11];

    // Parses the date in ISO8601 format
    // If "strict" is true Whether or not to perform a strict parse, which requires all parts of the date to be present
    Date.parseISO8601 = function (date, strict)
    {
        var struct, minutesOffset = 0;

        strict = !!strict;

        // Example date string: +002011-06-15T21:40:05.121+06:00

        if (!strict)
        {
            // Non-strict parsing
            struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date);
        }
        else
        {
            // Strict parsing
            struct = /^(\d{4}|[+\-]\d{6})\-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})(?:(Z)|([+\-]))(\d{2}):(\d{2})$/.exec(date);
        }

        if (struct)
        {
            // Avoid NaN timestamps caused by "undefined" values being passed to Date.UTC
            for (var i = 0, k; (k = numericKeys[i]); ++i)
            {
                struct[k] = +struct[k] || 0;
            }

            // Allow undefined days and months
            struct[2] = (+struct[2] || 1) - 1;
            struct[3] = +struct[3] || 1;

            if (struct[8] !== 'Z' && struct[9] !== undefined)
            {
                minutesOffset = struct[10] * 60 + struct[11];

                if (struct[9] === '+')
                {
                    minutesOffset = 0 - minutesOffset;
                }
            }

            return Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
        }

        return NaN;
    };

    // Parses the date in Microsoft format
    Date.parseMsDate = function (date)
    {
        var struct;

        if ((struct = /^\/Date\((d|-|.*)\)[\/|\\]$/.exec(date)))
        {
            var v = struct[1].split(/[-+,.]/);
            return new Date(v[0] ? +v[0] : 0 - +v[1]);
        }

        return NaN;
    };

    // Enhances the native JavaScript Date.parse function to support ISO8601 and Microsoft format dates.
    // Note: ES5 15.9.4.2 states that the string should attempt to be parsed as a an ISO8601 string
    // before falling back to any implementation-specific date parsing. The native Date.parse() doesn't 
    // do this on all browsers, so it needs to be overwritten to force this behavior and ensure consistency.
    Date.parse = function (date)
    {
        var timestamp;

        timestamp = Date.parseISO8601(date);

        if (!isNaN(timestamp))
        {
            return timestamp;
        }

        timestamp = Date.parseMsDate(date);

        if (!isNaN(timestamp))
        {
            return timestamp;
        }

        return origParse ? origParse(date) : NaN;
    };

} (Date));