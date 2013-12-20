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

        setup: function () {
            var thisObject = this,
                $this = $(thisObject);

            $this.on("pointerdown", function (event) {
                var start = $.event.special.sweep.start(event),
                    stop;

                function move(event) {
                    if (!start) {
                        return;
                    }

                    stop = $.event.special.sweep.stop(event);

                    // prevent scrolling
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
            });
        }
    };

    // sweepleft and sweepright are just dummies, we have to
    // setup the handler for sweep so attach a dummy event
    $.each(["sweepleft", "sweepright"], function (i, event) {
        $.event.special[event] = {
            setup: function () {
                $(this).on("sweep", $.noop);
            }
        };
    });

    // also handles presshold
    $.event.special.press = {
        pressholdThreshold: 750,
        setup: function () {
            var thisObject = this,
                $this = $(thisObject);

            $this.on("pointerdown", function (event) {
                var start = $.event.special.sweep.start(event),
                    stop,
                    timer,
                    origTarget = event.target,
                    isPresshold = false;

                // check that on pointermove we haven't swiped beyond the threshold for sweep
                function move(e) {
                    stop = $.event.special.sweep.stop(e);
                }

                // upon pointerup, if we didn't trigger "presshold" then trigger a "press".
                function up(event) {
                    clearTimeout(timer);
                    // $document.off("pointercancel", clearPressHandlers);

                    // check to see the action should be considered a a "sweep" event
                    if (stop && $.event.special.sweep.isSweep(start, stop)) {
                        return;
                    }

                    // ONLY trigger a 'press' event if the start target is
                    // the same as the stop target.
                    if (!isPresshold && origTarget === event.target) {
                        event.type = "press";
                        $.event.dispatch.call(thisObject, event);
                    }

                    // if this was a presshold, prevent this pointerup event from causing more events
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
                    isPresshold = true;

                    // check to see the action should be considered a a "sweep" event
                    if (!stop || !$.event.special.sweep.isSweep(start, stop)) {
                        event.type = "presshold";
                        $.event.dispatch.call(thisObject, event);
                    }
                }, $.event.special.press.pressholdThreshold);
            });
        }
    };

    // presshold is just a dummy, it's handled by "press".
    $.event.special.presshold = {
        setup: function () {
            $(this).on("press", $.noop);
        }
    };

})(jQuery);
