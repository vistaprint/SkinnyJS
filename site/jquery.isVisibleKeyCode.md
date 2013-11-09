---
layout: main
title: jquery.isVisibleKeyCode
---

## jQuery.isVisibleKeyCode

Enhances jQuery.Event with the method *isVisibleKeyCode()*, which returns true if the key 
pressed in a keyboard event is a visible character. Useful to filter out keys such as function and shift. 

### Usage

{% highlight javascript %}
    $(".text-field").on("keypress", function(e) {
       if (e.isVisibleKeyCode()) {
           doSomething(e.keyCode);
       });
{% endhighlight %}
