---
layout: main
title: jquery.customEvent
---

## jQuery.customEvent
A class that implements an observable event. 

This is useful when jQuery custom events aren't appropriate because there's no DOM element involved. 

This is implemented as a thin wrapper on jQuery.Callbacks().

### Usage

Here's a simple class *Car* that exposes the event *ondrive*:

{% highlight javascript %}
    var Car = function() {
        $.CustomEvent.create(this, "ondrive");
    
        this.drive = function() {
            // TODO some driving implementation
            this.ondrive.fire();
        }
    }
{% endhighlight %}

A consumer of Car could observe the event:

{% highlight javascript %}
    var car = new Car();
    car.ondrive.add(function() { alert("my car is driving!"); });
{% endhighlight %}

We can also customize the event object that is passed to observers:

{% highlight javascript %}
    var Car = function() {
        $.CustomEvent.create(this, "ondrive");
    
        this.drive = function(speed) {
            // Data will be passed to handlers via the event object
            this.ondrive.fire({ speed: speed }); 
        }
    }

    var car = new Car();
    car.ondrive.add(function(e) { alert("my car is driving at " + e.speed + "mph!"); });
{% endhighlight %}

The event object passed to handlers of jQuery.CustomEvent is a jQuery.Event, and is
also returned from jQuery.CustomEvent.fire(). This is useful if you want to use jQuery.Event's methods, 
such as *preventDefault()* and *isDefaultPrevented()* to allow observers to influence the behavior of the
object.

{% highlight javascript %}
    var Car = function() {
        $.CustomEvent.create(this, "ondrive");
    
        this.drive = function() {
            var evt = this.ondrive.fire(); 
            if (evt.isDefaultPrevented()) {
                // Stop driving!!!
            }
        }
    }
{% endhighlight %}
