/// <reference path="pointy.js" />

(function ($) {
    var OVER_TIMER = 'skinnyjs-hoverDelay-overTimer';
    var OUT_TIMER = 'skinnyjs-hoverDelay-outTimer';

    var _defaults = {
        over: $.noop,
        out: $.noop,
        delayOver: 0,
        delayOut: 0,
        touch: false
    };

    $.fn.hoverDelay = function (over, out, options) {
        if ($.isPlainObject(over)) {
            options = over;
        } else {
            if (!options) {
                options = {};
            }

            options.over = over;
            options.out = out;
        }

        var _options = $.extend({}, _defaults, options);

        var useTimers = _options.delayOver > 0 || _options.delayOut > 0;

        var clearTimers = function (el) {
            if (!useTimers) {
                return;
            }

            var overTimer = el.data(OVER_TIMER);
            var outTimer = el.data(OUT_TIMER);

            if (overTimer) {
                clearTimeout(overTimer);
                el.data(OVER_TIMER, null);
            }

            if (outTimer) {
                clearTimeout(outTimer);
                el.data(OUT_TIMER, null);
            }
        };

        function pointerEnter(event) {
            // sto ppropagation because this mouseover event can
            // double fire if a child of the element used is the target
            event.stopPropagation();

            if (_options.touch || !event.pointerType || event.pointerType !== 'touch') {
                var thisObject = this,
                    $this = $(thisObject);

                clearTimers($this);

                var call = function call() {
                    _options.over.call(thisObject, event);
                };

                if (_options.delayOver <= 0) {
                    call();
                } else {
                    $this.data(OVER_TIMER, setTimeout(call, _options.delayOver));
                }
            }
        }

        function pointerLeave(event) {
            // sto ppropagation because this mouseover event can
            // double fire if a child of the element used is the target
            event.stopPropagation();

            if (_options.touch || !event.pointerType || event.pointerType !== 'touch') {
                var thisObject = this,
                    $this = $(thisObject);

                clearTimers($this);

                var call = function call() {
                    _options.out.call(thisObject, event);
                };

                if (_options.delayOut <= 0) {
                    call();
                } else {
                    $this.data(OUT_TIMER, setTimeout(call, _options.delayOut));
                }
            }
        }

        if ($.support.pointer) {
            return this.on({
                'pointerenter': pointerEnter,
                'pointerleave': pointerLeave
            });
        } else {
            return this.on({
                'mouseenter': pointerEnter,
                'mouseleave': pointerLeave
            });
        }
    };

})(jQuery);

// Create a wrapper similar to jQuery's mouseenter/leave events
// using pointer events (pointerover/out) and event-time checks
jQuery.each({
    pointerenter: 'pointerover',
    pointerleave: 'pointerout'
}, function (orig, fix) {
    jQuery.event.special[orig] = {
        delegateType: fix,
        bindType: fix,
        handle: function (event) {
            var ret,
                target = this,
                related = event.relatedTarget,
                handleObj = event.handleObj;

            // For mousenter/leave call the handler if related is outside the target.
            // NB: No relatedTarget if the mouse left/entered the browser window
            if (!related || (related !== target && !jQuery.contains(target, related))) {
                event.type = handleObj.origType;
                ret = handleObj.handler.apply(this, arguments);
                event.type = fix;
            }
            return ret;
        }
    };
});
