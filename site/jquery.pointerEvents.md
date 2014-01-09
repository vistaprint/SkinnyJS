---
layout: main
title: jQuery.pointerEvents
---

## jQuery.pointerEvents

jQuery.pointerEvents is a polyfill for the new [pointer events api](http://www.w3.org/Submission/pointer-events/). It is an abstraction on top of touch and mouse events which mimics native pointer events. This is particularly useful because it will work across all devices which support either the Apple-style touch events (i.e. iOS, Android, Chrome OS) and those that support pointer events (i.e. Windows 8 and Windows Phone 7).

### Event types

- pointerdown: abstraction on top of mousedown and touchstart
- pointermove: abstraction on top of mousemove and touchmove
- pointerup: abstraction on top of mouseup and touchend
- pointerover: abstraction on top of mouseover (no touch equivalent)
- pointerout: abstraction on top of mouseout (no touch equivalent)

### Why this is important

The PointerEvents API is a new standard that is likely to be adopted by major browsers. The existing APIs for user input, the MouseEvents and the TouchEvents APIS, offer many inconsistent behaviors that pointer events attempts to standardize. Some of inconsistencies are:

- Upon touchstart or touchend, if you call preventDefault() it will prevent the emulated mouse event (mousedown or mouseup respectively) and click event. Whereas if you call preventDefault() upon a mousedown or mouseup event, the click event is always fired. Pointer Events never canceled the click event.

### Usage

{% highlight javascript %}
    $('#el').on('pointerdown', function (e) {

        // Getting coordinates
        var top = e.clientX;
        var left = e.clientY;

        // Detecting the underlying event type
        // Can be "mouse", "touch", or "pen"
        var underlyingEvent = e.originalType.pointerType;

    });
{% endhighlight %}