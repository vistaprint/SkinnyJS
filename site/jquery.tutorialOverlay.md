---
layout: main
title: jQuery.tutorialOverlay
---

# Tutorial overlay

<div class="toc">toc</div>

The **jquery.tutorialOverlay** plugin is a UI widget used to orient a user to a page that is either newly redesigned or is highly interactive. It serves to point out key interface elements in context of viewing a specific screen. It is used to explain the use of 1-5 features in a way that is quickly read and then dismissed.

## Features

### Content

An overlay can display arbitrary content centered on the screen.  This may be a button, and white window-like panel, or any other object.
Tips/callouts can be specified to appear relative to an element on the underlaying screen.  Each tip may be an image, text, or any other object.

### Unobtrusive syntax

Overlays can be created with a simple markup-based syntax, or, if you need more control, you can use the JavaScript API.

### Event driven extensibility

Overlays publish [events](#events) that can be used to extend their functionality.

## Demo
[Live demo >>](tutorial-overlay-demo.html)

## Usage

### Adding jQuery.tutorialOverlay to your site

Using the (skinny.js Download Builder)[http://vistaprint.github.io/SkinnyJS/download-builder.html], create a custom build which includes jquery.tutorialOverlay, along with any other skinny.js libraries you want. Include the following CSS and JavaScript files:

{% highlight html %}

<!--Tutorial overlay css-->
<link rel="stylesheet" href="skinnyjs/css/jquery.tutorialOverlay.css" />

<!--Include jquery before skinny.js-->
<script type="text/javascript" src="jquery.js"></script>

<!--Custom build of skinny.js from the download builder. Should include all dependencies for tutorial overlays-->
<script type="text/javascript" src="skinnyjs/skinny.js"></script>

<!--skinny.js Tutorial overlay library-->
<script type="text/javascript" src="skinnyjs/jquery.tutorialOverlay.js"></script>
{% endhighlight %}

### Creating an overlay

Overlays are designed to be used unobtrusively, but the entire programmatic API is exposed as well.

Here's an example of unobtrusive usage:

{% highlight html %}
<!-- specify an element ID to use as the overlay on page load -->
<span data-overlay-showonpageload="tutorialOverlay"></span>

<!-- elsewhere in the document, define the content of the overlay... -->
<div id="tutorialOverlay">
   <!-- tips specify their content, target element, and position relative to the target -->
  <div data-rel="tutorialTip" data-target="#invalidID" data-position="north">This tip will not be shown, because it has an invalid target.</div>
  <div data-rel="tutorialTip" data-target="img .example-image" data-position="east">This tip will appear east of all &lt;img&gt; tags with the .example-image class.</div>
</div>
{% endhighlight %}

To create an overlay programmatically, use one of the following methods:

{% highlight javascript %}
// Returns a jQuery object. Used for function/jQuery style code/chaining.
$("#tutorialOverlay").tutorialOverlay();

// Returns a tutorialOverlay object that can be used in OO style code.
$.tutorialOverlay.create({ content: "#tutorialOverlay" }).show();
{% endhighlight %}

For more information on the OO style, see [Tutorial Overlay object methods](#overlay_object_methods).

#### Declarative overlay attributes

When using the programmatic syntax to show overlays, you can use the following attributes to declaratively define settings for the overlay (note that these correspond
exactly to the [Settings](#settings) you can pass to the tutorialOverlay programmatic API):

* **data-overlay-zindex**: Can be used to set the z-index for the overlay. Don't use this unless you need to participate in a pre-existing z-index arms race. Defaults to 10000.         
* **data-overlay-onopen**: An inline event handler that fires when the overlay is shown. See [Events](#events) for more information.
* **data-overlay-onbeforeopen**: An inline event handler that fires before the overlay is shown. See [Events](#events) for more information.  
* **data-overlay-onclose**: An inline event handler that fires when the overlay is closed. See [Events](#events) for more information.        
* **data-overlay-onbeforeclose**: An inline event handler that fires before the overlay is closed. See [Events](#events) for more information.      
* **data-overlay-destroyOnClose**: If true, the overlay DOM will be destroyed and all events removed when the overlay closes. Defaults to ''false''.   
* **data-overlay-containerElement**: A jquery selector that specifies the parent container that should contain the overlay.  Defaults to ''body''.
* **data-overlay-hideOnClick**: If true, the overlay will be closed when the user clicks on it.  Defaults to ''true''.
* **data-overlay-showOnPageLoad**: Specifies the id of an element to use as an overlay and shows it on page load.
* **data-overlay-overlayId**: Specifies the id of an element to use as an overlay.
* **data-overlay-centerContent**: Specifies the selector of an element to center over the overlay.

{% highlight html %}
<span data-overlay-showonpageload="tutorialOverlay"></span>

<div
    id="tutorialOverlay"
    data-overlay-zindex=20000
    data-overlay-containerElement="body"
    data-overlay-centerContent="someContent">
  <div data-rel="tutorialTip" data-target="#someImage" data-position="east">This tip will appear east of #someImage.</div>
</div>
{% endhighlight %}

#### Settings

`$(selector).tutorialOverlay()` (and `$.tutorialOverlay.create()`) takes a settings object as an argument. Here are the available settings:

* **zindex**: Can be used to set the z-index for the overlay. Don't use this unless you need to participate in a pre-existing z-index arms race. Defaults to 10000.         
* **onopen**: An inline event handler that fires when the overlay is shown. See [Events](#events) for more information.
* **onbeforeopen**: An inline event handler that fires before the overlay is shown. See [Events](#events) for more information.  
* **onclose**: An inline event handler that fires when the overlay is closed. See [Events](#events) for more information.        
* **onbeforeclose**: An inline event handler that fires before the overlay is closed. See [Events](#events) for more information.      
* **destroyOnClose**: If true, the overlay DOM will be destroyed and all events removed when the overlay closes. Defaults to ''false''.   
* **containerElement**: A jquery selector that specifies the parent container that should contain the overlay.  Defaults to ''body''.
* **hideOnClick**: If true, the overlay will be closed when the user clicks on it.  Defaults to ''true''.
* **showOnPageLoad**: Specifies the id of an element to use as an overlay and shows it on page load.
* **overlayId**: Specifies the id of an element to use as an overlay.
* **centerContent**: Specifies the selector of an element to center over the overlay.

Here's an example. Note that you can (and usually should) do this all with *data-overlay* attributes:
{% highlight javascript %}
$("#tutorialOverlay").tutorialOverlay({ 
    destroyOnClose: "true",
    onbeforeclose: function(e) { 
        if (!confirm('Are you sure you want to close this?') { 
            e.preventDefault(); 
        }
    }
});
{% endhighlight %}
{% highlight html %}
<div id="#tutorialOverlay">
    <div data-rel="tutorialTip" data-target="#someImage" data-position="east">This tip will appear east of #someImage.</div>
</div>
{% endhighlight %}

### Overlay object methods

`$.tutorialOverlay.create()` returns an overlay object with the following methods:

* **show()**: Shows the overlay.
* **close()**: Closes the overlay.
* **destroy()**: Removes the overlay from the DOM and removes all events.
* **isShowing()**: Returns true iff the overlay is currently being displayed.
* **setHideOnClick()**: Specify whether the overlay should hide when the user clicks on it.
* **addtip()**: Add a tip to the overlay.
* **setCenterContent()**:  Set the content to display in the center of the overlay.

For example:

{% highlight javascript %}
var overlay = $.tutorialOverlay.create({ overlayId: "tutorialOverlay" });
overlay.show();
 
//close overlay
overlay.close();
{% endhighlight %}

You can call any overlay methods using the jQuery idiomatic syntax as well:

{% highlight javascript %}
// Creates and opens the overlay
$("#tutorialOverlay").tutorialOverlay().show();

// Closes the overlay
$("#tutorialOverlay").tutorialOverlay("close");
{% endhighlight %}

### Events

Overlays support a number of lifecycle events:

* **beforeopen**: Fires before the overlay opens. Calling event.preventDefault() on the event object will cancel the opening of the overlay.
* **open**: Fires after the overlay has opened, and has animated into place.
* **beforeclose**: Fires before the overlay closes. Calling event.preventDefault() on the event object will cancel the closing of the overlay.
* **close**: Fires after the overlay closes.

#### Handling events
There are two ways to assign event handlers, as options to `$.tutorialOverlay.create()`, or by adding event handlers to the overlay object returned by `$.tutorialOverlay.create()`.

Here is an example of using the beforeopen event:

{% highlight javascript %}
$.tutorialOverlay.create({ 
    overlayId: "tutorialOverlay", 
    onbeforeopen: function(e) { 
        if (!confirm("Are you sure you want to show this overlay?")) {
            e.preventDefault(); 
        }
    });
{% endhighlight %}

This example is completely equivalent:

{% highlight javascript %}
var overlay = $.tutorialOverlay.create({ overlayId: "tutorialOverlay" });
overlay.onbeforeopen.add(function(e) { 
    if (!confirm("Are you sure you want to show this overlay?")) { 
        e.preventDefault(); 
    }
});
{% endhighlight %}

#### Unobtrusive overlay events

*TODO*

If you want to assign handlers unobtrusively, you can access the overlay when it is created with the overlaycreate event:

{% highlight html %}
<a href="#colorPicker" data-rel="tutorialOverlay" id="colorPickerLink">Show color picker</a>
{% endhighlight %}

Then, in script, you can access the overlay:

{% highlight javascript %}
$("#colorPickerLink").on("overlaycreate", function(e)
{
    e.overlay.onopen.add(function() { alert("opened"); });
});
{% endhighlight %}