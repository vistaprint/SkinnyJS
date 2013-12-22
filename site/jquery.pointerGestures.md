---
layout: main
title: jQuery.pointerGestures
---

## jQuery.pointerGestures

jQuery.pointerGestures is a set of jQuery custom events that mimic [jQuery mobile's touch events](http://api.jquerymobile.com/category/events/) which also support the [pointer events api](http://www.w3.org/Submission/pointer-events/).

### Event types

- sweep: Triggered when a horizontal drag of 30px or more (and less than 75px vertically) occurs within 1 second duration.
- sweepleft: Triggered when a sweep event occurs moving in the left direction.
- sweepright: Triggered when a swipe event occurs moving in the right direction.
- press: Triggered after a quick, complete touch or click event.
- presshold: Triggered after a sustained complete touch event.

### Usage

{% highlight javascript %}
    $('#el').on('presshold', function (e) {
        alert('Don\'t be trying to hold me down!');
    });
{% endhighlight %}