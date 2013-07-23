skinny.js: Slim little jQuery plugins [![Build Status](https://secure.travis-ci.org/labaneilers/SkinnyJS.png?branch=master)](http://travis-ci.org/labaneilers/SkinnyJS)
===========================================
skinny.js is a collection of jQuery plugins that are useful for building web applications. Its design is a response to having used too many JavaScript frameworks that require you to buy into a particular philosophy, coding style, or architecture. Instead, skinny.js embraces the single responsibility principle, and aims to create tiny, granular libraries with minimal dependencies.

skinny.js libraries depend only on jQuery, and in a few cases, each other. They are not intended to be used as a bundle; so if you need one library, you are encouraged to use only it and its dependencies.

Skinny libraries
----------
* jQuery.partialLoad: Works like jQuery.load, but is more intelligent about executing downloaded scripts (i.e. don't re-run scripts that are already loaded)

* [jQuery.clientRect](http://labaneilers.github.io/SkinnyJS/jquery.clientRect.html): Gets element coordinates several orders of magnitude more efficiently than jQuery.top()/left()
* [jQuery.delimitedString](http://labaneilers.github.io/SkinnyJS/jquery.delimitedString.html): Base class for parsing delimited strings, such as querystrings or CSS styles
* [jQuery.queryString](http://labaneilers.github.io/SkinnyJS/jquery.queryString.html): Parses querystrings (the opposite of jQuery.param())
* [jQuery.css](http://labaneilers.github.io/SkinnyJS/jquery.css.html): Parses and serializes CSS style strings
* [jQuery.url](http://labaneilers.github.io/SkinnyJS/jquery.url.html): Parses and serializes URLs.
* [jQuery.disableEvent](http://labaneilers.github.io/SkinnyJS/jquery.disableEvent.html): Temporarily disables/enables all event handlers for a DOM element
* [jQuery.hostIframe](http://labaneilers.github.io/SkinnyJS/jquery.hostIframe.html): Manages references between iframe content and their host window
* [jQuery.hoverDelay](http://labaneilers.github.io/SkinnyJS/jquery.hoverDelay.html): Simplified, more practical version of jQuery.hoverIntent plugin. TODO reference
* [jQuery.htmlEncode](http://labaneilers.github.io/SkinnyJS/jquery.htmlEncode.html): Bare bones HTML encoding
* [jQuery.imageSize](http://labaneilers.github.io/SkinnyJS/jquery.imageSize.html): Some utilities for dealing with image sizes, async loading, and fitting images to a bounding box
* [jQuery.isVisibleKeyCode](http://labaneilers.github.io/SkinnyJS/jquery.isVisibleKeyCode.html): Extension to jQuery.Event which indicates if a keypress is a visible character (i.e. not a function or modifier key)
* [jQuery.msAjax](http://labaneilers.github.io/SkinnyJS/jquery.msAjax.html): Microsoft freindly AJAX. Handles the quirks of ASMX, WCF, DataJsonContractSerializer, Microsoft's JSON date format, and provides an interface identical to jQuery.ajax().
* [jQuery.ns](http://labaneilers.github.io/SkinnyJS/jquery.ns.html): Declare namespaces without boilerplate
* [jQuery.postMessage](http://labaneilers.github.io/SkinnyJS/jquery.postMessage.html): Provides cross-document messaging support, works on all browsers to IE6 (without URL fragments and polling).
* [jQuery.proxyAll](http://labaneilers.github.io/SkinnyJS/jquery.proxyAll.html): Binds functions to their host object (like jQuery.proxy(), but for all functions declared as properties of an object at once)
* [jQuery.uncomment](http://labaneilers.github.io/SkinnyJS/jquery.uncomment.html): Allows lazy evaluation of HTML blobs by removing them from comment blocks
* [jQuery.customEvent](http://labaneilers.github.io/SkinnyJS/jquery.customEvent.html): TODO
* [jQuery.cookie](http://labaneilers.github.io/SkinnyJS/jquery.cookie.html): TODO

Skinny UI components
----------
* jQuery.menu: A traditional heirarchical menu widget, designed from the ground up to be both touch and mouse friendly. TODO: Get existing docs from the wiki
* jQuery.modalDialog: A powerful modal dialog system that works across all devices: TODO: Get existing docs from the wiki