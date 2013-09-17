---
layout: main
title: jquery.htmlEncode
---

## jQuery.htmlEncode

Dead simple HTML encoding.

### Usage

{% highlight javascript %}
    var encoded = $.htmlEncode('<a href="somelink.html">some link</a>');
    encoded == "&lt;a href=&quot;somelink.html&quot;&rt;some link&lt;/a&rt;"; // true
{% endhighlight %}
