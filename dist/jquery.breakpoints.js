/// <reference path="jquery.delimitedString.js" />

(function($)
{
    var processBreakpoints = function($el, breakpoints)
    {
        var width = $el.innerWidth();

        var entered = [];
        var left = [];

        for (var name in breakpoints)
        {
            var breakpoint = breakpoints[name];
            var cssClass = "breakpoint-" + name;
            
            // Detect which breakpoints have been entered and which ones have been left.
            if (width <= breakpoint.max && width >= breakpoint.min)
            {
                if (!$el.hasClass(cssClass))
                {
                    entered.push({ breakpoint: breakpoint, cssClass: cssClass });
                }
            }
            else
            {
                if ($el.hasClass(cssClass))
                {
                    left.push({ breakpoint: breakpoint, cssClass: cssClass });
                }
            }
        }

        // Batch call all DOM writes to prevent unnecessary forced re-flows
        modifyClassesBatch($el, entered, "addClass");
        modifyClassesBatch($el, left, "removeClass");

        // Batch call event handlers after all DOM manipulation is done
        fireEventsBatch($el, entered, "enter");
        fireEventsBatch($el, left, "leave");
    };

    var modifyClassesBatch = function($el, breakpoints, modifyClassMethod)
    {
        if (breakpoints.length > 0)
        {
            var classes = $.map(breakpoints, function(bp) { return bp.cssClass; }).join(" ");
            $el[modifyClassMethod](classes);
        }
    };

    var fireEventsBatch = function($el, breakpoints, eventName)
    {
        for (var i=0; i<breakpoints.length; i++)
        {
            var breakpoint = breakpoints[i].breakpoint;
            if (breakpoint[eventName])
            {
                breakpoint[eventName].call($el[0], breakpoint);
            }

            var ev = new $.Event("breakpoint:" + eventName);
            ev.breakpoint = breakpoint;
            $el.trigger(ev);
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

            breakpoint.name = name;

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

            // Try to get the breakpoint classes added to the DOM as early as possible
            // to avoid reflows at DOM ready.
            try
            {
                wrapper();
            }
            catch (ex)
            {
            }

            $(document).ready(wrapper);
            $(window).on("resize orientationchange breakpoints:refresh", wrapper);
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