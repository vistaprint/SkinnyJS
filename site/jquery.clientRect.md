---
layout: main
title: jquery.clientRect
---

## jQuery.clientRect

Returns a rectangle object containing the height, width, top, left, bottom, and right coordinates 
for a given element relative to the document.

Highly performant, and cross browser.

Note: jQuery's jQuery.height()/width() methods are inefficient (read: wicked slow) for two reasons:

1. They don't use [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/element.getBoundingClientRect), 
which gets a DOM element's coordinates directly from the render tree, and is much faster than reading CSS properties 
and having to calculate offsets from parent elements by walking the DOM. All modern browsers support getBoundingClientRect.
2. Even if they did use it, the API requires two separate calls to get height/width, which makes it inherently twice as slow.
jQuery.clientRect() can be orders of magnitude more performant (depending on the size and complexity of the DOM).

### Usage
{% highlight javascript %}
    var rect = $(".something").clientRect();
{% endhighlight %}