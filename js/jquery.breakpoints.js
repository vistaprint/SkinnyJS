/// <reference path="jquery.delimitedString.js" />

(function($)
{
    var processBreakpoints = function($el, breakpoints)
    {
        var width = $el.innerWidth();

        for (var name in breakpoints)
        {
            var breakpoint = breakpoints[name];
            var cssClass = "breakpoint-" + name;
            
            if (width <= breakpoint.max && width >= breakpoint.min)
            {
                // If there is an "enter" callback defined, and we are transitioning
                // into this breakpoint, call the callback.
                var callEnter = false;
                if (breakpoint.enter)
                {
                    if (!$el.hasClass(cssClass))
                    {
                        callEnter = true;
                    }
                }

                $el.addClass(cssClass);

                if (callEnter)
                {
                    breakpoint.enter.apply($el[0]);
                }
            }
            else
            {
                // If there is an "leave" callback defined, and we are transitioning
                // into this breakpoint, call the callback.
                var callLeave = false;
                if (breakpoint.leave)
                {
                    if (!$el.hasClass(cssClass))
                    {
                        callLeave = true;
                    }
                }

                $el.removeClass(cssClass);

                if (callLeave)
                {
                    breakpoint.enter.apply($el[0]);
                }
            }
        }
    };

    var compareInts = function compare(a, b) 
    {
        if (a < b)
        {
            return -1;
        }
         
        if (a > b)
        {
            return 1;
        }
        
        return 0;
    };

    var normalizeBreakpoints = function(breakpoints)
    {
        var maxWidths = [];

        for (var name in breakpoints)
        {
            var breakpoint = breakpoints[name];

            if ($.isNumeric(breakpoint))
            {
                var max = parseInt(breakpoint, 10);
                breakpoint = 
                {
                    max: max
                };

                breakpoints[name] = breakpoint;
            }
            else if (breakpoint.hasOwnProperty("max"))
            {
                breakpoints.max = parseInt(breakpoints.max, 10);
            }
            else
            {
                throw new Error("No max specified for breakpoint: " + name);
            }

            maxWidths.push(breakpoint.max);
        }

        maxWidths.sort(compareInts);

        return maxWidths;
    };

    var setMinWidths = function(breakpoints, maxWidths)
    {
        for (var name in breakpoints)
        {
            var breakpoint = breakpoints[name];

            if (breakpoint.hasOwnProperty("min"))
            {
                continue;
            }

            for (var i=0; i<maxWidths.length; i++)
            {
                if (breakpoint.max == maxWidths[i])
                {
                    if (i === 0)
                    {
                        breakpoint.min = 0;
                    }
                    else
                    {
                        breakpoint.min = maxWidths[i-1] + 1;
                    }
                    break;
                }
            }
        }
    };

    var addMaxBreakpoint = function(breakpoints, maxWidths)
    {
        if (!maxWidths || maxWidths.length === 0)
        {
            return;
        }
        
        var largestBreakpoint = maxWidths[maxWidths.length - 1];

        breakpoints.max = { min: largestBreakpoint+1, max: Infinity };
    };

    /* test-code */

    $.breakpointsPrivate = 
    {
        processBreakpoints: processBreakpoints,
        normalizeBreakpoints: normalizeBreakpoints,
        setMinWidths: setMinWidths,
        addMaxBreakpoint: addMaxBreakpoint
    };

    /* end-test-code */

    $.fn.breakpoints = function(breakpoints)
    {
        var maxWidths = normalizeBreakpoints(breakpoints);
        setMinWidths(breakpoints, maxWidths);
        addMaxBreakpoint(breakpoints, maxWidths);

        this.each(function(i, el)
        {
            var wrapper = function()
            {
                processBreakpoints($(el), breakpoints);
            };

            $(document).ready(wrapper);
            $(window).on("resize orientationchange", wrapper);
        });

        return this;
    };

    // Unobtrusive style
    $.fn.breakpointsFromAttrs = function()
    {
        this.find("[data-breakpoints]").each(function(i, el)
        {
            var $el = $(el);

            var bpStr = $el.attr("data-breakpoints");
            if (!bpStr)
            {
                return;
            }

            var breakpoints = $.parseDelimitedString(bpStr, ";", ":", $.trim, $.trim);
            $el.breakpoints(breakpoints);
        });

        return this;
    };

    $(document).ready(function() 
    { 
        $(document).breakpointsFromAttrs(); 
    });

})(jQuery);