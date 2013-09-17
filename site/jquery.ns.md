---
layout: main
title: jquery.ns
---

## jQuery.ns

Declare namespaces with no boilerplate.
Won't overwrite existing namespaces.

### Usage

{% highlight javascript %}
    $.ns("widgetco.util.html")
    
    widgetco.util.html.writeHeader = function() { // ...
{% endhighlight %}