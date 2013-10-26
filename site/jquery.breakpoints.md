---
layout: main
title: jquery.breakpoints
---

## jQuery.breakpoints
Applies CSS classes automatically to an element according on its pixel width. This is designed to be similar in concept to media queries, but using the size of an element instead of the size of the browser window. This is useful for designing components to be responsive, without assuming that they will be 100% of the window size.

### Usage

The easiest way to create breakpoints for an element is to specify them in terms of max widths, and let the plugin calculate the corresponding min widths:

Unobtrusive syntax:
{% highlight html %}
<div class="foo" data-breakpoints="mobile:480; medium:760;"></div>
{% endhighlight %}

Or, you can use the equivalent JavaScript call:
{% highlight javascript %}
$(".foo").breakpoints({ "mobile": 480, "medium": 760 });
{% endhighlight %}

Then, you can target these breakpoints with css classes based on the names you assigned:

{% highlight css %}
.foo
{
    background-image: url(large-size.jpg);
}

.foo.breakpoint-medium
{
    background-image: url(medium-size.jpg);
}

.foo.breakpoint-mobile
{
    background-image: url(small-size.jpg);
}
{% endhighlight %}

#### Overlapping breakpoints

You can create overlapping breakpoints. Note in this example, that the "mobile" and "mobileOrTablet" breakpoints overlap:

{% highlight javascript %}
$(".foo").breakpoints({ "mobile": { min: 0, max: 480 }, "mobileOrTablet": { min: 0, max: 760 }});
{% endhighlight %}

#### Breakpoint events

You can assign event handlers to breakpoints. In this example, we AJAX in different content depending on the breakpoint.

{% highlight javascript %}
$(".foo").breakpoints({ 
    "mobile": 
    { 
        max: 480, 
        enter: function() 
        {
            $(this).load("/mobile-content"); 
        } 
    }, 
    "tablet": 
    { 
        max: 760,
        enter: function() 
        {
            $(this).load("/tablet-content"); 
        } 
    }
});
{% endhighlight %}

