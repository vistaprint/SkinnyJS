/// <reference path="pointy.js" />

(function ($) {
    var OVER_TIMER = 'skinnyjs-hoverDelay-overTimer';
    var OUT_TIMER = 'skinnyjs-hoverDelay-outTimer';

    var _defaults = {
        over: $.noop,
        out: $.noop,

        // delays before firing the onOver and onOut callbacks,
        // if zero, hoverDelay acts exactly like jQuery's $.fn.hover
        // except that it supports pointer events and a few other features
        delayOver: 0,
        delayOut: 0,

        // listen for touch taps as if they're hovering events, this
        // is not usually useful or desired and is therefore off by default
        touch: false,

        // an array of additional children to consider as-is these were actual
        // children of the target element's dom.
        addChildren: null
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

        var useTimers = typeof _options.delayOver === 'function' || _options.delayOver > 0 || _options.delayOut > 0;

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
            // stop propagation because this mouseover event can
            // double fire if a child of the element used is the target
            event.stopPropagation();

            if (_options.touch || !event.pointerType || event.pointerType !== 'touch') {
                var thisObject = this,
                    $this = $(thisObject);

                clearTimers($this);

                var call = function call() {
                    _options.over.call(thisObject, event);
                };

                var delay = _options.delayOver;

                if (typeof delay === 'function') {
                    delay = delay();
                }

                if (delay <= 0) {
                    call();
                } else {
                    $this.data(OVER_TIMER, setTimeout(call, delay));
                }
            }
        }

        function pointerLeave(event) {
            // stop propagation because this mouseover event can
            // double fire if a child of the element used is the target
            event.stopPropagation();

            if (_options.touch || !event.pointerType || event.pointerType !== 'touch') {
                var thisObject = this,
                    $this = $(thisObject);

                clearTimers($this);

                var call = function call() {
                    _options.out.call(thisObject, event);
                };

                // if we do not have a delay when the pointer leaves the target area,
                // then call the observer immediately.
                if (_options.delayOut <= 0) {
                    call();
                    return;
                }

                // create a timeout for the leave observer, which is cleared
                // if the client re-enters the target area before the timer is triggered
                $this.data(OUT_TIMER, setTimeout(function () {
                    $(document).off('pointermove', pointerMove);

                    if (pointerPosition) {
                        var overElement = document.elementFromPoint(pointerPosition.x, pointerPosition.y);
                        if (thisObject === overElement || jQuery.contains(thisObject, overElement) || overAdditionalChildren(overElement)) {
                            return; // since it appears the mouse is in fact over the targeted area, do not trigger the callback
                        }

                        pointerPosition = null; // null the pointerPosition, we do not need it cached now
                    }

                    call();
                }, _options.delayOut));

                $(document).on('pointermove', pointerMove);
            }
        }

        // stores the last known mouse position
        var pointerPosition;

        // pointer move listener is used when we start a timer on pointer leave,
        // we start a listener for mouse move to keep track of the mouse position.
        // this position is used on the mouse leave timeout callback to verify the
        // mouse is not over a target element.
        // this becomes necessary for things like jquery.menu where the menu can
        // "appear" under the mouse and no "mouseover" or "pointerover" event is
        // triggered when you are already over the element.
        function pointerMove(event) {
            pointerPosition = {
                x: event.clientX,
                y: event.clientY
            };
        }

        // utility to see if we are over another one of the provided jQuery elements
        function overAdditionalChildren(overElement) {
            // if we do not have any children, this doesn't do anything
            if (!_options.addChildren) {
                return false;
            }

            // standardize the additional children as an array
            var children = Array.prototype.slice.call(_options.addChildren);

            for (var i = 0, l = children.length; i < l; i++) {
                var target = children[i];
                if (target === overElement || jQuery.contains(target, overElement)) {
                    return true;
                }
            }

            return false;
        }

        return this.on({
            'pointerenter': pointerEnter,
            'pointerleave': pointerLeave
        });
    };

})(jQuery);

// Create a wrapper similar to jQuery's mouseenter/leave events
// using pointer events (pointerover/out) and event-time checks
jQuery.each({
    pointerenter: navigator.pointerEnabled ? 'pointerover' : (navigator.msPointerEnabled ? 'MSPointerOver' : 'mouseover'),
    pointerleave: navigator.pointerEnabled ? 'pointerout' : (navigator.msPointerEnabled ? 'MSPointerOut' : 'mouseout')
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
