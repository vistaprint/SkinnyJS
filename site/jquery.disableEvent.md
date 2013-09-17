---
layout: main
title: jquery.disableEvent
---

## jQuery.disableEvent

This plugin allows temporary disabling/enabling of all event handlers for a specific event type and element.

### Usage
To disable an event for a link:

{% highlight javascript %}
    $(".disabled-link").disableEvent("click");
{% endhighlight %}

Click handlers set with jQuery will no longer fire.
These event handlers can be re-enabled:

{% highlight javascript %}
    $(".disabled-link").enableEvent("click");
{% endhighlight %}

These methods take any number of space-delimited event names:

{% highlight javascript %}
    $(".disabled-link").disableEvent("click touchstart touchdown mousedown");
{% endhighlight %}
