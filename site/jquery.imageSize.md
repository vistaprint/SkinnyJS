---
layout: main
title: jquery.imageSize
---

## jquery.imageSize

This is a library of utilities for loading images and adding them to the DOM.

### jQuery.naturalSize()

$.naturalSize() loads an image asynchronously and calls back when the image has been loaded, passing the size of the image to the callback.    

{% highlight javascript %}
    $.naturalSize("/someimage.png", function(size) {        
        // the image has been loaded
        doSomethingWithSize(size.width, size.height);
    });

    // $.naturalSize() also returns a promise
    $.naturalSize("/someimage.png")
        .then(function(size){
                doSomethingWithSize(size);
            },
            function(err){
                handleSomeError(err.message);
            });
{% endhighlight %}

### jQuery.rectWithAspectRatio()

$.rectWithAspectRatio() finds the maximum rectangle size of the specified aspect ratio that can fit in the specified container rectangle.

{% highlight javascript %}

    var boundingBox = {
        top: 0,
        left: 0,
        width: 100,
        height: 100
    };

    // 'rect' will be the maximum size rectangle possible with the specified aspect ratio, 
    // centered within the bounding box
    var rect = $.rectWithAspectRatio(boundingBox, 0.5);

    assert.equal(rect.top, 0);
    assert.equal(rect.left, 25);
    assert.equal(rect.width, 50);
    assert.equal(rect.height, 100);

{% endhighlight %}