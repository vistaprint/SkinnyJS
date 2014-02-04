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

{% endhighlight %}

### Creating an overlay

Overlays are designed to be used unobtrusively, but the entire programmatic API is exposed as well.

Tutorial Overlays can be specified in the HTML via the **tutorial-overlay** class.  Any element within this overlay element that has the **tutorial-overlay-tip** class will be a tip on the overaly.  The main content to render in the center of the overlay is indicated with the **tutorial-overlay-content** class.
By default, any element with a class of **close-overlay** will close the overlay when clicked.

Here's an example of unobtrusive usage:

{% highlight html %}
<div class="tutorial-overlay" data-overlay-autoload="true" data-overlay-hideonclick="false">
    <div class="tutorial-overlay-content"> Some content to display in the center of the overlay.
        <a href="#" class="close-overlay">Close Overlay</a>
    </div>
    <!-- tips specify their content, target element, and position relative to the target -->
    <div class="tutorial-overlay-tip" data-overlay-tip-target="#invalidID" data-overlay-tip-position="north">This tip will not be shown, because it has an invalid target.</div>
    <div class="tutorial-overlay-tip" data-overlay-tip-target="img.example-image" data-overlay-tip-position="east">This tip will appear east of all &lt;img&gt; tags with the .example-image class.</div>
</div>
{% endhighlight %}

To create an overlay programmatically, use one of the following methods:

{% highlight javascript %}
// Returns a jQuery object. Used for function/jQuery style code/chaining.
$("#tutorialOverlay").tutorialOverlay();

// Returns a tutorialOverlay object that can be used in OO style code.
$.tutorialOverlay.create({ overlay: $("#overlay")[0] }).show();
{% endhighlight %}

For more information on the OO style, see [Tutorial Overlay object methods](#overlay_object_methods).

#### Declarative overlay attributes

When using the programmatic syntax to show overlays, you can use the following attributes to declaratively define settings for the overlay (note that these correspond exactly to the [Settings](#settings) you can pass to the tutorialOverlay programmatic API):

* **data-overlay-zindex**: Can be used to set the z-index for the overlay. Don't use this unless you need to participate in a pre-existing z-index arms race. Defaults to 10000.         
//* **data-overlay-destroyOnClose**: If true, the overlay DOM will be destroyed and all events removed when the overlay closes. Defaults to ''false''.   
* **data-overlay-hideOnClick**: If true, the overlay will be closed when the user clicks on it.  Defaults to ''true''.

{% highlight html %}
<div
    id="tutorialOverlay"
    class="tutorial-overlay"
    data-overlay-zindex=20000
    data-overlay-autoload="true"
  <div class="tutorial-overlay-tip" data-overlay-tip-target="#someImage" data-overlay-tip-position="east">This tip will appear to the right of #someImage.</div>
</div>
{% endhighlight %}

#### Declarative tip attributes

When using the programmatic syntax to show overlays, you can use the following attributes to declaratively define settings for the tips/callouts in the overlay (note that these correspond exactly to the [Settings](#settings) you can pass to the tutorialOverlay programmatic API):

* **data-overlay-tip-target**: Set the target element to which the the tip will be relatively positioned.
* **data-overlay-tip-position**: "north", "south", "east", or "west.  Describes the desired position relative to the target element.
* **data-overlay-tip-color**: The color of the tip arrow.
* **data-overlay-tip-offset**: The number of pixels of space between the tip and the target.

{% highlight html %}
<div class="tutorial-overlay-tip" data-overlay-tip-target="#someImage" data-overlay-tip-position="east">This tip will appear to the right of #someImage.</div>
{% endhighlight %}

#### Settings

`$(selector).tutorialOverlay()` (and `$.tutorialOverlay.create()`) takes a settings object as an argument. Here are the available settings:

* **zindex**: Can be used to set the z-index for the overlay. Don't use this unless you need to participate in a pre-existing z-index arms race. Defaults to 10000.         
//* **destroyOnClose**: If true, the overlay DOM will be destroyed and all events removed when the overlay closes. Defaults to ''false''.   
* **hideOnClick**: If true, the overlay will be closed when the user clicks on it.  Defaults to ''true''.
* **autoLoad**: Specifies whether to show this overlay on page load.

Here's an example. Note that you can (and usually should) do this all with *data-overlay* attributes:
{% highlight javascript %}
$("#tutorialOverlay").tutorialOverlay({ 
    hideOnClick: "false",
    autoLoad: "true"
});
{% endhighlight %}
{% highlight html %}
<div id="#tutorialOverlay" class="tutorial-overlay">
    <div class="tutorial-overlay-tip" data-overlay-tip-target="#someImage" data-overlay-tip-position="east">This tip will appear east of #someImage.</div>
</div>
{% endhighlight %}

### Overlay object methods

`$.tutorialOverlay.create()` returns an overlay object with the following methods:

* **show()**: Shows the overlay.
* **hide()**: Closes the overlay.
* **destroy()**: Removes the overlay from the DOM and removes all events.
* **isShowing()**: Returns true iff the overlay is currently being displayed.
* **setHideOnClick()**: Specify whether the overlay should hide when the user clicks on it.
* **addTip()**: Add a tip to the overlay.
* **setCenterContent()**:  Set the content to display in the center of the overlay.

For example:

{% highlight javascript %}
var overlay = $.tutorialOverlay.create({ autoLoad: "false" });
overlay.show();
 
//close overlay
overlay.hide();
{% endhighlight %}

You can call any overlay methods using the jQuery idiomatic syntax as well:

{% highlight javascript %}
// Creates and opens the overlay
$("#tutorialOverlay").tutorialOverlay("show", options);

$(""#tutorialOverlay").tutorialOverlay("addTip", tooltipOptions);

// Closes the overlay
$("#tutorialOverlay").tutorialOverlay("hide");
{% endhighlight %}
