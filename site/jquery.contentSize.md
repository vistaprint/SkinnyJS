---
layout: main
title: jquery.contentSize
---

## jQuery.contentSize

Returns the height and width of the specified page's content: the total scrolling size.

Measures the document content using a more accurate approach relying on body.scrollHeight,
especially when the content is in an iframe- in which case, the body.scrollHeight always returns
the viewport size, even if the content is smaller.

### Usage

Gets the content width, including scrollbars:

{% highlight javascript %}
    var rect = $(window).contentSize();
{% endhighlight %}

Gets the content width, excluding scrollbars: 

{% highlight javascript %}
    var rect = $(window).contentSize(true);
{% endhighlight %}

Works in a window inside an iframe:

{% highlight javascript %}
    var rect = $(iframeWindow).contentSize();
{% endhighlight %}

### Dependencies
This library uses jquery.clientRect (part of skinny.js) to measure elements efficiently.