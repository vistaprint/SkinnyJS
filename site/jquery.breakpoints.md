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

#### Triggering breakpoints manually

Breakpoints are updated automatically when the screen resizes (i.e. the "resize" or "orientationchange" event). If you modify content manually (i.e. through script), and want to trigger a recalculation of the breakpoints, you can do this by triggering the breakpoints:refresh event:

{% highlight javascript %}
// Set up breakpoints
$(".foo").breakpoints();

// Later...

// Trigger a recalculation of breakpoints:
$(".foo").trigger("breakpoints:refresh");
{% endhighlight %}

#### Optimization

On highly optimized websites, it is a best practice to load most JavaScript files asynchronously and after content is loaded. However, if you're using jquery.breakpoints, you would want to have the plugin run and set CSS classes as early as possible to avoid unnecessary reflows.

To support this scenario, the jquery.breakpoints plugin is separated into 2 parts:

1. **The core breakpoints logic**. This is designed to be put at the top of the page. It has *no* dependencies, not even jQuery.
2. **The jquery.breakpoints plugin**. This should go at the bottom of the page, with your other scripts.

The core breakpoints file supplies the method *skinny.breakpoints.setup()*, which you can call on an element inline: this ensures that it has its CSS classes available as early as possible. For example:

{% highlight html %}
<html>
  <head>
    <link rel="stylesheet" href="content.css"></script>

    <!-- Load the core breakpoints logic here -->
    <script type="text/javascript" src="breakpoints.js"></script>
  </head>
  <body>

    <div id="someContent" class="some-content" breakpoints="small:480; medium:760;">(content goes here)</div>
    <!-- Call the breakpoints plugin as soon as the content is loaded -->
    <script type="text/javascript">skinny.breakpoints.setup('someContent');</script>

    <!-- The bulk of your javascript should go at the bottom of the page, including jquery.breakpoints.js. -->
    <script type="text/javascript" src="jquery.js"></script>
    <script type="text/javascript" src="jquery.breakpoints.js"></script>
  </body>
</html>
{% endhighlight %}