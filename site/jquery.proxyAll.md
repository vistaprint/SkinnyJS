---
layout: main
title: jquery.proxyAll
---

## jQuery.proxyAll

Uses jQuery.proxy() to bind all methods of an object to the object in a batch.
Binding a method to an object ensures that the "this" variable always refers to the object.

### Usage

{% highlight javascript %}
    var Car = function() {
        $.proxyAll(this);
    };
     
    Car.prototype = {
        drive: function(speed) {
            // some implementation
        },
     
        driveFast: function() {
            this.drive("120mph");
        },
     
        driveSlow: function() {
            this.drive("15mph");
        }
    };
{% endhighlight %}
