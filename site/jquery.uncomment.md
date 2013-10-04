---
layout: main
title: jquery.uncomment
---

## jQuery.uncomment

Allows lazy evaluation of HTML blobs by removing them from comment blocks.

### Usage

Emit expensive content from the server in comment blocks
to ensure lazy loading across all browsers:

{% highlight html %}
    <div class="commented-container">
      <!--
      <script src="some-expensive-widget.js"></script>
      <img src="some-expensive-widget-logo.jpg" />
      -->
    </div>
{% endhighlight %}

Then, use this plugin to remove the comments and load the content:

{% highlight javascript %}
    $(".commented-container").uncomment();
{% endhighlight %}