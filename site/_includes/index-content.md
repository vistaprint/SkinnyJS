skinny.js is a collection of jQuery plugins that are useful for building web applications. Its design is a response to having used too many JavaScript frameworks that require you to buy into a particular philosophy, coding style, or architecture. Instead, skinny.js embraces the single responsibility principle, and aims to create tiny, granular libraries with minimal dependencies.

[Download skinny.js](http://labaneilers.github.io/SkinnyJS/download-builder.html)

Skinny libraries
------------------

* [jQuery.partialLoad](http://labaneilers.github.io/SkinnyJS/js/jquery.partialLoad.html): Works like jQuery.load, but is more intelligent about executing downloaded scripts (i.e. don't re-run scripts that are already loaded)
* [jQuery.clientRect](http://labaneilers.github.io/SkinnyJS/js/jquery.clientRect.html): Gets element coordinates several orders of magnitude more efficiently than jQuery.top()/left()
* [jQuery.delimitedString](http://labaneilers.github.io/SkinnyJS/js/jquery.delimitedString.html): Base class for parsing delimited strings, such as querystrings or CSS styles
* [jQuery.queryString](http://labaneilers.github.io/SkinnyJS/js/jquery.queryString.html): Parses querystrings (the opposite of jQuery.param())
* [jQuery.css](http://labaneilers.github.io/SkinnyJS/js/jquery.css.html): Parses and serializes CSS style strings
* [jQuery.url](http://labaneilers.github.io/SkinnyJS/js/jquery.url.html): Parses and serializes URLs.
* [jQuery.disableEvent](http://labaneilers.github.io/SkinnyJS/js/jquery.disableEvent.html): Temporarily disables/enables all event handlers for a DOM element
* [jQuery.hostIframe](http://labaneilers.github.io/SkinnyJS/js/jquery.hostIframe.html): Manages references between iframe content and their host window
* [jQuery.hoverDelay](http://labaneilers.github.io/SkinnyJS/js/jquery.hoverDelay.html): Simplified, more practical version of jQuery.hoverIntent plugin. TODO reference
* [jQuery.htmlEncode](http://labaneilers.github.io/SkinnyJS/js/jquery.htmlEncode.html): Bare bones HTML encoding
* [jQuery.imageSize](http://labaneilers.github.io/SkinnyJS/js/jquery.imageSize.html): Some utilities for dealing with image sizes, async loading, and fitting images to a bounding box
* [jQuery.isVisibleKeyCode](http://labaneilers.github.io/SkinnyJS/js/jquery.isVisibleKeyCode.html): Extension to jQuery.Event which indicates if a keypress is a visible character (i.e. not a function or modifier key)
* [jQuery.msAjax](http://labaneilers.github.io/SkinnyJS/js/jquery.msAjax.html): Microsoft friendly AJAX. Handles the quirks of ASMX, WCF, DataJsonContractSerializer, Microsoft's JSON date format, and provides an interface identical to jQuery.ajax().
* [jQuery.ns](http://labaneilers.github.io/SkinnyJS/js/jquery.ns.html): Declare namespaces without boilerplate
* [jQuery.postMessage](http://labaneilers.github.io/SkinnyJS/js/jquery.postMessage.html): Provides cross-document messaging support, works on all browsers to IE6 (without URL fragments and polling).
* [jQuery.proxyAll](http://labaneilers.github.io/SkinnyJS/js/jquery.proxyAll.html): Binds functions to their host object (like jQuery.proxy(), but for all functions declared as properties of an object at once)
* [jQuery.uncomment](http://labaneilers.github.io/SkinnyJS/js/jquery.uncomment.html): Allows lazy evaluation of HTML blobs by removing them from comment blocks
* [jQuery.customEvent](http://labaneilers.github.io/SkinnyJS/js/jquery.customEvent.html): A class that implements an observable event, useful for cases where there's no DOM element involved.
<!-- * [jQuery.cookie](http://labaneilers.github.io/SkinnyJS/js/jquery.cookie.html): TODO -->

Skinny UI components
------------------

* [jQuery.menu](http://labaneilers.github.io/SkinnyJS/js/jquery.menu.html): A traditional hierarchical menu widget, designed from the ground up to be both touch and mouse friendly. TODO: Get existing docs from the wiki
* [jQuery.modalDialog](http://labaneilers.github.io/SkinnyJS/modal-dialogs.html): A powerful modal dialog system that works across all devices: TODO: Get existing docs from the wiki

Dependencies
------------------

skinny.js libraries were designed to have minimal dependencies, and are not intended to be used as a bundle. For this reason, we don't provide a concatenated, minified version of the whole set of libraries. Take the libraries you need, include their dependencies, and concatenate/minify to your
heart's content using your own project's build system. 

### How do I know what dependencies my file has?
All dependencies in skinny.js plugins are marked at the top using the following syntax:

    /// <reference path="{path}" />