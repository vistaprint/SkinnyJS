// Pointer Events pollyfill for jQuery

(function ($, window, document, undefined)
{

var support = {
	touch: "ontouchend" in document,
	pointer: !!(navigator.pointerEnabled || navigator.msPointerEnabled)
};

$.extend( $.support, support );

function triggerCustomEvent (obj, eventType, event)
{
	var originalType = event.type;
	event = standardizePointerEvent(event);
	event.type = eventType;
	$.event.dispatch.call( obj, event );
	event.type = originalType;
}

// utility to just proxy through an event to a new event name
function proxyEventType (oldEventType, newEventType)
{
	return function (data, namespace)
	{
		var thisObject = this;
		$(this).on(oldEventType, function (event)
		{
			triggerCustomEvent(thisObject, newEventType, event);
		});
	};
}

// utility to just prevent the default event behavior
function preventDefault (event)
{
	event.preventDefault();
}

var POINTER_TYPE_UNAVAILABLE = "unavailable";
var POINTER_TYPE_TOUCH = "touch";
var POINTER_TYPE_PEN = "pen";
var POINTER_TYPE_MOUSE = "mouse";

function standardizePointerEvent (event)
{
	var evObj = event.originalEvent;

	evObj.POINTER_TYPE_UNAVAILABLE = POINTER_TYPE_UNAVAILABLE;
	evObj.POINTER_TYPE_TOUCH = POINTER_TYPE_TOUCH;
	evObj.POINTER_TYPE_PEN = POINTER_TYPE_PEN;
	evObj.POINTER_TYPE_MOUSE = POINTER_TYPE_MOUSE;

	// The old spec used numbers for the pointer type,
	// standardize to the new spec.
	switch (evObj.pointerType) {
		case 2:
			evObj.pointerType = evObj.POINTER_TYPE_TOUCH;
			break;
		case 3:
			evObj.pointerType = evObj.POINTER_TYPE_PEN;
			break;
		case 4:
			evObj.pointerType = evObj.POINTER_TYPE_MOUSE;
			break;
		default:
			if (/^touch/i.test(event.type))
			{
				evObj.pointerType = evObj.POINTER_TYPE_TOUCH;
			}
			else if (/^mouse/i.test(event.type) || event.type == 'click')
			{
				evObj.pointerType = evObj.POINTER_TYPE_MOUSE;
			}
			break;
	}

	if (!evObj.pointerType)
	{
		evObj.pointerType = evObj.POINTER_TYPE_UNAVAILABLE;
	}

	console.log(event.type, evObj.pointerType);

	return event;
}

// if browser does not natively handle pointer events,
// create special custom events to mimic them
if (!support.pointer)
{
	$.event.special.pointerdown =
	{
		setup: function (data, namespace)
		{
			var thisObject = this,
				$this = $( thisObject );

			// add support for touch events
			if (support.touch)
			{
				$this.on('touchstart', function (event)
				{
					// prevent the click event from firing as well
					event.preventDefault();

					triggerCustomEvent(thisObject, 'pointerdown', event);
				});
			}

			// now add support for mouse events
			$this.on('click', function (event)
			{
				// me.trigger('pointerdown', event);
				triggerCustomEvent(thisObject, 'pointerdown', event);
			});
		},

		teardown: function (data, namespace)
		{
			console.log('teardown', this);
		}
	};

	// pointer over replaces mouseover, there is no equivalent for touch events
	$.event.special.pointerover =
	{
		setup: proxyEventType('mouseover', 'pointerover')
	};

	// pointerout replaces mouseout, there is no equivalent for touch events
	$.event.special.pointerout =
	{
		setup: proxyEventType('mouseout', 'pointerout')
	};
}

// for IE10 specific, we proxy though events so we do not need to deal
// with the various names or renaming of events.
else if (navigator.msPointerEnabled && !navigator.pointerEnabled)
{
	$.event.special.pointerdown =
	{
		setup: function (data, namespace)
		{
			var thisObject = this;
			$(this).on('MSPointerDown', function (event)
			{
				triggerCustomEvent(thisObject, 'pointerdown', event);
			});

			// prevent click event from happening.. since you cannot
			// cancel the click event from the pointerdown event
			$(this).on('click', preventDefault);
		}
	};

	// called before pointerdown for devices without hover support (see spec http://www.w3.org/Submission/pointer-events/ 3.2.6)
	$.event.special.pointerover =
	{
		setup: proxyEventType('MSPointerOver', 'pointerover')
	};

	// called after pointerup for devices without hover support (see spec 3.2.7)
	$.event.special.pointerout =
	{
		setup: proxyEventType('MSPointerOut', 'pointerout')
	};
}

})( jQuery, window, document);
