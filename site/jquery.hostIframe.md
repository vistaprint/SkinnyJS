---
layout: main
title: jquery.hostIframe
---

## jQuery.hostIframe

This plugin provides methods to get references to the host iframe element from within the iframe, 
and to get a window/document reference for a specified iframe.

### Usage

#### jQuery.fn.hostIframe()
From a document within an iframe, you can get a jQuery object containing the iframe:

{% highlight javascript %}
    var $iframe = $(document).hostIframe();
{% endhighlight %}

This may be useful if you want information about the iframe, e.g. the dimensions:

{% highlight javascript %}
    var width = $(document).hostIframe().width();
{% endhighlight %}

#### jQuery.fn.iframeDocument()
You can get a reference from the iframe element to the document inside it:

{% highlight javascript %}
    // Get the URL of the iframe's document, which may be different from that of the iframe's src property
    var iframeUrl = $("iframe").iframeDocument()[0].location.href
{% endhighlight %}

#### jQuery.fn.iframeWindow()
You can get a reference from the iframe element to the window inside it:

{% highlight javascript %}
    // Post a message to the iframe's window using skinny.js's $.postMessage() plugin
    $("iframe").iframeWindow().postMessage("hi there", "http://www.foo.com");
{% endhighlight %}
