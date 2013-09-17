---
layout: main
title: jquery.partialLoad
---

## jQuery.partialLoad

Similar to $.load(), though this will execute scripts on the target page more intelligently.

If a target selector is passed, it will load only the target DOM fragment into the current DOM element.
In this case, it will execute all scripts in the target DOM. Inline scripts in the target DOM will also be executed.
If no target selector is passed, it will load ALL scripts on the requested page, 
EXCEPT for scripts that have been loaded on the host page already.
Inline scripts from the whole page will be executed.

### Usage

{% highlight javascript %}
    // The jQuery object's DOM element will be populated with the web service content
    $(".contentRegion").partialLoad( 

        // The URL of the web service
        "/some-html-content", 

        // A selector defining the DOM elements you want to extract from the HTML returned by the web service
        ".interesting-part", 

        // (optional) A data object. If supplied, it will be POSTed to the web service
        { somekey: "somevalue" }, 

        // A callback fired when the load is complete (or fails)
        myCallback); 
{% endhighlight %}