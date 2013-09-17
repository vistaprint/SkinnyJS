---
layout: main
title: jquery.css
---

## jQuery.css

Parses/encodes CSS strings. For example, the following CSS string:

    "background-color:red; width:25px; border-left: 1px black solid;

can be transformed into a JavaScript object:

{% highlight javascript %}
    {
        "backgroundColor": "red",
        "width": "25px",
        "borderLeft": "1px black solid"
    }
{% endhighlight %}

or vice-versa.

### Usage

Parse a CSS string to a JavaScript object:

{% highlight javascript %}
    var parsed = $.parseCssString("color: blue; padding-top: 3px");
    parsed.paddingTop === "3px";  // true
{% endhighlight %}

Encode a JavaScript object as a CSS string:

{% highlight javascript %}
    var encoded = $.encodeCssString({ color: "blue", paddingTop: "3px" });
    encoded === "color:blue;padding-top:3px";  // true
{% endhighlight %}

Transform camel-cased CSS properties (for JavaScript) to dash case (for CSS):

{% highlight javascript %}
    var dashCased = $.camelToDashCase("paddingTop");
    dashCased === "padding-top";  // true
{% endhighlight %}

Transform dash case (for CSS) to camel-cased CSS properties (for JavaScript):

{% highlight javascript %}
    var camelCased = $.dashToCamelCase("padding-top");
    camelCased === "paddingTop";  // true
{% endhighlight %}

### Dependencies

This library uses jquery.delimitedString (part of skinny.js), which abstracts encoding/decoding of key-value pairs.