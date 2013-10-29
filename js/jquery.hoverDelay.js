/// <reference path="jquery.pointerEvents.js" />

(function($)
{
    var OVER_TIMER = 'skinnyjs-hoverDelay-overTimer';
    var OUT_TIMER = 'skinnyjs-hoverDelay-outTimer';

    var _defaults = {
        over: $.noop,
        out: $.noop,
        delayOver: 0,
        delayOut: 0,
        mouseOnly: true
    };

    $.fn.hoverDelay = function (over, out, options)
    {
        if ($.isPlainObject(over))
        {
            options = over;
        }
        else
        {
            options.over = over;
            options.out = out;
        }
        
        var _options = $.extend({}, _defaults, options);

        var clearTimers = function (el)
        {
            var overTimer = el.data(OVER_TIMER);
            var outTimer = el.data(OUT_TIMER);

            if (overTimer)
            {
                clearTimeout(overTimer);
                el.data(OVER_TIMER, null);
            }
            
            if (outTimer)
            {
                clearTimeout(outTimer);
                el.data(OUT_TIMER, null);
            }
        };

        function mouseOver (event)
        {
            if (!$.support.pointer || !_options.mouseOnly || event.originalEvent.pointerType == event.originalEvent.POINTER_TYPE_MOUSE)
            {
                var me = $(this);
                clearTimers(me);

                var call = $.proxy(function call()
                {
                    _options.over.call(this, event);
                }, this);

                if (_options.delayOver <= 0)
                {
                    call();
                }
                else
                {
                    me.data(OVER_TIMER, setTimeout(call, _options.delayOver));
                }
            }
        }

        function mouseOut (event)
        {
            if (!$.support.pointer || !_options.mouseOnly || event.originalEvent.pointerType == event.originalEvent.POINTER_TYPE_MOUSE)
            {
                var me = $(this);
                clearTimers(me);

                var call = $.proxy(function call()
                {
                    _options.out.call(me, event);
                }, this);

                if (_options.delayOut <= 0)
                {
                    call();
                }
                else
                {
                    me.data(OUT_TIMER, setTimeout(call, _options.delayOut));
                }
            }
        }

        if ($.support.pointer)
        {
            return this.on({
                'pointerover': mouseOver,
                'pointerout': mouseOut
            });
        }
        else
        {
            return this.hover(mouseOver, mouseOut);
        }
    };

})(jQuery);
