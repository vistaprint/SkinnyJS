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