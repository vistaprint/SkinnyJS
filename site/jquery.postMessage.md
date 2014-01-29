---
layout: main
title: jquery.postMessage
---

## jQuery postMessage plugin

Wraps HTML5 postMessage for cross-origin message sending between windows.
Fallback implementation works on browsers that don't support postMessage.

Based on concepts from: <http://benalman.com/projects/jquery-postmessage-plugin/>

Improved for non-awesome browsers by using iframes for communication instead of url fragments and polling. This technique eliminates race conditions where messages sent in rapid succession might not be received. It also removes the need for polling.

Supports almost any conceivable browser, tested with IE6+

### Usage

#### Polyfill setup

To support IE6-7 (and IE8-10 for non-frame windows), you need to make the polyfill HTML file (postmessage.htm) available on your web server.
For example, you could put the file here:

    http://www.mysite.com/scripts/thirdparty/skinnyjs/postmessage.htm

IMPORTANT: This file must be on the same domain as the content you want to communicate with. It cannot be hosted on a different domain (i.e. Google CDN).

Once the file is available, you need to configure the postMessage plugin to point to it. Add this line anywhere on your page (or as the first/last line of jquery.postMessage.js):

{% highlight javascript %}
    window._jqueryPostMessagePolyfillPath = "/scripts/thirdparty/skinnyjs/postmessage.htm";
{% endhighlight %}

#### Sending a message to another window

$.postMessage() has the following signature:

{% highlight javascript %}
    $.postMessage(
        message, // The message to send (string)
        targetHost, // The host of the target window (i.e. http://www.vistaprint.com)
        targetWindow // A reference to the target window
        );
{% endhighlight %}

Note that the $.postMessage() API is slightly different from the HTML5 standard window.postMessage(),
in that it requires explicitly specifying the domain of the target window. This is necessary because there's
no way to determine the target window's domain programatically, and the domain is required for the
polyfill technique to work.

Example usage:

{% highlight javascript %}
    $.postMessage(
        "this is a message",
        "http://www.foo.com",
        window.frames["fooWindow"]
        );
{% endhighlight %}

#### Listening to messages from another window

To listen for messages from another window, use jQuery's built in event handling infrastructure and listen for "message" events on the window object:

This example simply alerts every message it receives, from any origin:

{% highlight javascript %}
    $(window).on("message", function(e) {
        alert(e.data); // Alerts "this is a message"
    });
{% endhighlight %}

In general, its a good idea to filter out requests from unknown domains. This example filters messages not from http://www.foo.com:

{% highlight javascript %}
    $(window).on("message", function(e) {
            if (e.origin !== "http://www.foo.com") {
                return;
            }
            alert(e.data); // Alerts "this is a message"
        });
{% endhighlight %}

This example alerts every message it receives, from any subdomain of foo.com:

{% highlight javascript %}
    $(window).on("message", function(e) {
        if (origin.search(/http:\/\/[^\.]*\.foo\.com$/gi) < 0) {
            return;
        }
        alert(e.data); // Alerts "this is a message"
    });
{% endhighlight %}

Its also a common practice to "namespace" messages so your handlers don't respond to messages they don't know how to handle:

{% highlight javascript %}
    $(window).on("message", function(e) {
        if (e.origin !== "http://www.foo.com") {
            return;
        }
        
        if (e.data.indexOf("fruit:") !== 0) {
            return;
        }
         
        // TODO: Remove the "fruit:" namespace and do something with the message
    });
{% endhighlight %}
