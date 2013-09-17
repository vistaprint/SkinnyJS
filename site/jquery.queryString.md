---
layout: main
title: jquery.queryString
---

## jQuery.queryString

Parses querystrings. For example, the following querystring:

    "name=John&address=1%202%20West%20St&phone=(123)%20123-1234"

can be transformed into a JavaScript object:

{% highlight javascript %}
    {
        "name": "John",
        "address": "12 West St",
        "phone": "(123) 123-1234"
    }
{% endhighlight %}

This is the inverse of [jQuery.param()](http://api.jquery.com/jQuery.param/)

### Usage

#### $.deparam(queryString)
Parse a querystring to a JavaScript object:

{% highlight javascript %}
    var qs = $.deparam("icecream=vanilla&brownie=chocolate");
    qs.brownie === "chocolate";  // true
{% endhighlight %}

#### $.currentQueryString()
Get the querystring from the current document.location as a parsed object:

{% highlight javascript %}
    // Current document.location: http://www.foo.com?icecream=vanilla&brownie=chocolate
    var qs = $.currentQueryString();
    qs.icecream === "vanilla"; // true
{% endhighlight %}

#### $.appendQueryString(url, parsedQueryString)
There's also a method to append a parsed querystring to a URL:

{% highlight javascript %}
    var url = $.appendQueryString("http://www.foo.com", { "icecream": "vanilla", "brownie": "chocolate"});
    url === "http://www.foo.com?icecream=vanilla&brownie=chocolate";  // true
{% endhighlight %}

### Dependencies
This library uses jquery.delimitedString (part of skinny.js), which abstracts encoding/decoding of key-value pairs.
