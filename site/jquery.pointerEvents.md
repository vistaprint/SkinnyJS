---
layout: main
title: jQuery.pointerEvents
---

## jQuery.pointerEvents

jQuery.pointerEvents adds a polyfill for the new [pointer events api](http://www.w3.org/Submission/pointer-events/). It falls back to touch and mouse events and delegates the information in a standardize format following the pointer event spec to the native pointer methods.

### Supports events

- pointerdown
- pointermove
- pointerup
- pointerover
- pointerout

### Usage

{% highlight javascript %}
    $('#el').on('pointerdown', function (event) {
    	if (event.originalType.pointerType == 'mouse') {
    		console.log('you clicked on me with a mouse');
    	} else if (event.originalType.pointerType == 'touch') {
    		console.log('you clicked one me with a touch device')
    	} else if (event.originalType.pointerType == 'pen') {
    		console.log('you clicked on me with a pen');
    	} else {
    		console.log('I do not want to know what you just clicked on me with')
    	}
    });
{% endhighlight %}