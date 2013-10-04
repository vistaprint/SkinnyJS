---
layout: main
title: jquery.scrollAnchor
---

## jQuery.scrollAnchor plugin

Provides smooth scrolling to same-page reference links using hashes (<a href="#something">).

### Dependencies
jQuery.scrollAnchor has two dependencies:

* jQuery.observeChildren.js (also part of skinny.js).

### Example Usage:

{% highlight html %}
    <a href="#example" data-scroll-anchor>click me</a>
    <div id="example"></div>
{% endhighlight %}

### Options

* =data-scroll-offset= Offset for the final scroll position, default is 20.
* =data-scroll-selector= Rather than using the hypertext hash reference (#ref) using this query selector to find the element to scroll to.
* =data-scroll-speed= Time in milliseconds for scroll animation, default is 800.