/// <reference path="jquery.pointerEvents.js" />

(function ($) {

    // also handles sweepleft, sweepright
    $.event.special.sweep = {
        // More than this horizontal displacement, and we will suppress scrolling.
        scrollSupressionThreshold: 30,

        // More time than this, and it isn't a sweep (swipe) it's a "hold" gesture.
        durationThreshold: 750,

        // Sweep horizontal displacement must be more than this.
        horizontalDistanceThreshold: 30,

        // Sweep vertical displacement must be less than this.
        verticalDistanceThreshold: 75,

        start: function (event) {
            return {
                time: +new Date(),
                coords: [event.pageX, event.pageY],
                origin: $(event.target)
            };
        },

        stop: function (event) {
            return {
                time: +new Date(),
                coords: [event.pageX, event.pageY]
            };
        },

        isSweep: function (start, stop, checkTime) {
            return (checkTime ? stop.time - start.time < $.event.special.sweep.durationThreshold : true) &&
                Math.abs(start.coords[0] - stop.coords[0]) > $.event.special.sweep.horizontalDistanceThreshold &&
                Math.abs(start.coords[1] - stop.coords[1]) < $.event.special.sweep.verticalDistanceThreshold;
        },

        handleSweep: function (start, stop) {
            if ($.event.special.sweep.isSweep(start, stop, true)) {
                var dir = start.coords[0] > stop.coords[0] ? "left" : "right";

                start.origin
                    .trigger("sweep", dir)
                    .trigger("sweep" + dir);
            }
        },

        add: $.event.delegateSpecial(function (handleObj) {
            var thisObject = this,
                $this = $(thisObject);

            handleObj.pointerdown = function (event) {
                var start = $.event.special.sweep.start(event),
                    stop;

                // we need to call prevent default because on IE browsers,
                // dragging anything with a mouse will start dragging the
                // element for "copy and paste" functionality
                // on other browsers, it will start selecting text
                // event.preventDefault();

                function move(event) {
                    if (!start) {
                        return;
                    }

                    stop = $.event.special.sweep.stop(event);

                    // prevent scrolling on touch devices
                    if (Math.abs(start.coords[0] - stop.coords[0]) > $.event.special.sweep.scrollSupressionThreshold) {
                        event.preventDefault();
                    }
                }

                function up() {
                    $this.off("pointermove", move);

                    if (start && stop) {
                        $.event.special.sweep.handleSweep(start, stop);
                    }

                    start = stop = undefined;
                }

                $this
                    .on("pointermove", move)
                    .one("pointerup", up);

                // set a timeout to ensure we cleanup, in case the "pointerup" isn't fired
                setTimeout(function () {
                    $this
                        .off("pointermove", handleObj.selector, move)
                        .off("pointerup", handleObj.selector, up);
                }, $.event.special.sweep.durationThreshold);
            };

            $this.on("pointerdown", handleObj.selector, handleObj.pointerdown);
        }),

        remove: $.event.delegateSpecial.remove(function (handleObj) {
            $(this).off("pointerdown", handleObj.selector, handleObj.pointerdown);
        })
    };

    // sweepleft and sweepright are just dummies, we have to
    // setup the handler for sweep so attach a dummy event
    $.each(["sweepleft", "sweepright"], function (i, event) {
        $.event.special[event] = {
            add: $.event.delegateSpecial(function (handleObj) {
                handleObj.noop = $.noop;
                $(this).on("sweep", handleObj.selector, handleObj.noop);
            }),

            remove: $.event.delegateSpecial.remove(function (handleObj) {
                $(this).off("sweep", handleObj.selector, handleObj.noop);
            })
        };
    });

    // utility to return the scroll-y position
    function scrollY() {
        return window.scrollY || $(window).scrollTop();
    }

    // also handles presshold
    $.event.special.press = {
        pressholdThreshold: 750,

        add: $.event.delegateSpecial(function (handleObj) {
            var thisObject = this;

            handleObj.pointerdown = function (event) {
                var start = $.event.special.sweep.start(event),
                    startScroll = scrollY(),
                    stop,
                    timer,
                    origTarget = event.target,
                    isPresshold = false,
                    $this = $(this);

                // check that on pointermove we haven't swiped beyond the threshold for sweep
                function move(e) {
                    stop = $.event.special.sweep.stop(e);
                }

                // upon "pointerup", if we didn't trigger "presshold" then trigger a "press".
                function up(event) {
                    clearTimeout(timer);
                    // $document.off("pointercancel", clearPressHandlers);

                    // unbind the pointer move
                    $this.off("pointermove", move);

                    // check to see if they scrolled, even 5 pixels
                    if (Math.abs(startScroll - scrollY()) > 5) {
                        return;
                    }

                    // check to see the action should be considered a a "sweep" event
                    if (stop && $.event.special.sweep.isSweep(start, stop)) {
                        return;
                    }

                    // Trigger a "press" event if the start target is the same as the stop target.
                    if (!isPresshold && origTarget === event.target) {
                        event.type = "press";
                        $.event.dispatch.call(thisObject, event);
                    }

                    // if this was a "presshold", prevent this "pointerup" event from causing more events
                    else if (isPresshold) {
                        event.stopPropagation();
                    }
                }

                $this
                    .on("pointermove", move)
                    .one("pointerup", up);

                // TODO: if the pointer is canceled for some reason, we need to cleanup
                // $document.on("pointercancel", clearPressHandlers);

                timer = setTimeout(function () {
                    // unbind the pointer move
                    $this.off("pointermove", move);

                    // toggle signal to ensure when the "pointerup" event we stop propagation
                    isPresshold = true;

                    // check to see if they scrolled, even 5 pixels
                    if (Math.abs(startScroll - scrollY()) > 5) {
                        return;
                    }

                    // check to see the action should be considered a a "sweep" event
                    if (stop && $.event.special.sweep.isSweep(start, stop)) {
                        return;
                    }

                    // Trigger a "presshold" event if the start target is the same as the stop target.
                    if (origTarget === event.target) {
                        event.type = "presshold";
                        $.event.dispatch.call(thisObject, event);
                    }
                }, $.event.special.press.pressholdThreshold);
            };

            $(thisObject).on("pointerdown", handleObj.selector, handleObj.pointerdown);
        }),

        remove: $.event.delegateSpecial.remove(function (handleObj) {
            $(this).off("pointerdown", handleObj.selector, handleObj.pointerdown);
        })
    };

    // presshold is just a dummy, it's handled by "press".
    $.event.special.presshold = {
        add: $.event.delegateSpecial(function (handleObj) {
            handleObj.noop = $.noop;
            $(this).on("press", handleObj.selector, handleObj.noop);
        }),

        remove: $.event.delegateSpecial.remove(function (handleObj) {
            $(this).off("press", handleObj.selector, handleObj.noop);
        })
    };

})(jQuery);
