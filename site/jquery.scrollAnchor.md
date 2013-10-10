---
layout: main
title: jquery.scrollAnchor
---

## jQuery.scrollAnchor

Provides smooth scrolling to same-page reference links using anchor links.

### Example Usage:

{% highlight html %}
    <a href="#example" data-scroll-anchor>click me</a>

    ...
    
    <div id="example"></div>
{% endhighlight %}

### Options

* **data-scroll-offset** Offset for the final scroll position, default is 20.
* **data-scroll-selector** Rather than using the hypertext hash reference (#ref) using this query selector to find the element to scroll to.
* **data-scroll-speed** Time in milliseconds for scroll animation, default is 800.