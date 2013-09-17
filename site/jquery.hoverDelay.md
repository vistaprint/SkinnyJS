---
layout: main
title: jquery.hoverDelay
---

## jQuery.hoverDelay

Assigns mouseover and mouseout handlers to the specified element, but the handlers
are only fired after the specified delay. This is particularly useful in preventing widgets from
activating on mouseover when the user mouses over them while attempting to activate a different object.

### Usage

{% highlight javascript %}
    $(".menu-item").hoverDelay({
        over: function(e) { activateWidget(e); }, // mouseover handler
        out: function(e) { activateWidget(e); }, // mouseout handler
        delayOver: 350, // fire mouseover after 350 milliseconds
        delayOut: 0 // fire mouseout immediately
    });
{% endhighlight %}

The jQuery.Event object is passed to the handlers just as if they were added via jQuery.fn.on()
