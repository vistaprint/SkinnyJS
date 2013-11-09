---
layout: main
title: jQuery.pointerEvents
---

## jQuery.pointerEvents

jQuery.pointerEvents adds a polyfill for the new [pointer events api](http://www.w3.org/Submission/pointer-events/). It falls back to touch and mouse events and delegates the information in a standardize format following the pointer event spec to the native pointer methods.

### Event types

- pointerdown
- pointermove
- pointerup
- pointerover
- pointerout

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