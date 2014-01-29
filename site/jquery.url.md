---
layout: main
title: jquery.url
---

## jQuery.Url

This class parses/encodes URLs, and provides an interface that parallels the browser's Location object, except using jQuery style getter/setter methods instead of simple properties.

Note: This class doesn't support some of the more esoteric features of URLs.
If you need this kind of support, you should use a more robust (and heavyweight) implementation such as
[node.js's Url module](https://github.com/joyent/node/blob/master/lib/url.js).

### Usage
####Parse a URL:

{% highlight javascript %}
    var url = new $.Url("http://www.foo.com:8080/pages/page1.html?key1=value1&key2=value2#someAnchor")
    
    url.protocol() === "http"; // true
    url.hostname() === "www.foo.com"; // true
    url.host() === "www.foo.com:8080"; // true
    url.port() === "8080"; // true
    url.pathname() === "/pages/page1.html"; // true
    url.search() === "?key1=value1&key2=value2"; // true
    url.hash() === "#someAnchor"; // true

    // The queryString property is a simple parsed object which contains key value pairs.
    url.queryString.key1 === "value1"; // true
    url.queryString.key2 === "value2"; // true
{% endhighlight %}

####Manipulating the querystring
Once the URL is parsed, you can manipulate the querystring:

{% highlight javascript %}
    // Adds a parameter, or overwrites one if it already exists
    url.set("key3", "value3")
    
    // Gets the value of an existing parameter
    var key1Value = url.get("key1")
    
    // Gets the value of an existing parameter, 
    // specifying a default in case the value doesn't exist
    var key1Value = url.get("key1", "some default value")
    
    // Removes a parameter
    url.remove("key3")
{% endhighlight %}

#### Serializing back to a URL string
The *toString()* method of $.Url will write back to a string:

{% highlight javascript %}
    document.location = url.toString();
{% endhighlight %}
