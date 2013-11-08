/// <reference path="jquery.pointerEvents.js" />

(function ($)
{

	// also handles sweepleft, sweepright
	$.event.special.sweep =
	{
		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a sweep (swipe) it's a "hold" gesture.
		durationThreshold: 1000,

		// Sweep horizontal displacement must be more than this.
		horizontalDistanceThreshold: 30,

		// Sweep vertical displacement must be less than this.
		verticalDistanceThreshold: 75,

		start: function (event)
		{
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event;
			return {
						time: +new Date(),
						coords: [ data.pageX, data.pageY ],
						origin: $( event.target )
					};
		},

		stop: function (event)
		{
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event;
			return {
						time: +new Date(),
						coords: [ data.pageX, data.pageY ]
					};
		},

		handleSweep: function (start, stop)
		{
			if ( stop.time - start.time < $.event.special.sweep.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.sweep.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.sweep.verticalDistanceThreshold ) {

				var dir = start.coords[0] > stop.coords[ 0 ] ? "left" : "right";

				start.origin.trigger( "sweep", dir )
					.trigger( "sweep" + dir );
			}
		},

		add: function(params)
		{
			var thisObject = this,
				$this = $( thisObject );

			function pointerdown (event)
			{
				var start = $.event.special.sweep.start(event),
					stop;

				function move (event)
				{
					if ( !start ) {
						return;
					}

					stop = $.event.special.sweep.stop(event);

					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.sweep.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				}

				function up()
				{
					$this.off("pointermove", move);

					if (start && stop)
					{
						$.event.special.sweep.handleSweep( start, stop );
					}
					start = stop = undefined;
				}

				$this
					.on("pointermove", move)
					.one("pointerup", up);
			}

			if (params.selector)
			{
				$this.on("pointerdown", params.selector, pointerdown);
			}
			else
			{
				$this.on("pointerdown", pointerdown);
			}
		}
	};

	// sweepleft and sweepright are just dummies, we have to
	// setup the handler for sweep so attach a dummy event
	$.each(["sweepleft", "sweepright"], function (i, event)
	{
		$.event.special[event] =
		{
			setup: function()
			{
				$(this).on("sweep", $.noop);
			}
		};
	});

})(jQuery);