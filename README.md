skinny.js: Slim little jQuery plugins [![Build Status](https://secure.travis-ci.org/vistaprint/SkinnyJS.png?branch=master)](http://travis-ci.org/vistaprint/SkinnyJS)
===========================================

[View the project page](http://vistaprint.github.io/SkinnyJS)

skinny.js is a collection of jQuery plugins that are useful for building web applications. Its design is a response to having used too many JavaScript frameworks that require you to buy into a particular philosophy, coding style, or architecture. Instead, skinny.js embraces the single responsibility principle, and aims to create tiny, granular libraries with minimal dependencies.

[Download skinny.js](http://vistaprint.github.io/SkinnyJS/download-builder.html)

Skinny libraries
------------------

* [date-parse](http://vistaprint.github.io/SkinnyJS/date-parse.html): Polyfill for Date.parse to ensure support for ISO 8601 dates. Also provides support for Microsoft JSON format dates.
* [jQuery.clientRect](http://vistaprint.github.io/SkinnyJS/jquery.clientRect.html): Gets element coordinates several orders of magnitude more efficiently than jQuery.top()/left()
* [jQuery.cookies](http://vistaprint.github.io/SkinnyJS/jquery.cookies.html): Practically oriented cookie management.
* [jQuery.css](http://vistaprint.github.io/SkinnyJS/jquery.css.html): Parses and serializes CSS style strings
* [jQuery.customEvent](http://vistaprint.github.io/SkinnyJS/jquery.customEvent.html): A class that implements an observable event, useful for cases where there's no DOM element involved.
* [jQuery.delimitedString](http://vistaprint.github.io/SkinnyJS/jquery.delimitedString.html): Base class for parsing delimited strings, such as querystrings or CSS styles
* [jQuery.disableEvent](http://vistaprint.github.io/SkinnyJS/jquery.disableEvent.html): Temporarily disables/enables all event handlers for a DOM element
* [jQuery.hostIframe](http://vistaprint.github.io/SkinnyJS/jquery.hostIframe.html): Manages references between iframe content and their host window
* [jQuery.hoverDelay](http://vistaprint.github.io/SkinnyJS/jquery.hoverDelay.html): Binds mouseover/out event handlers with a delay. Useful for authoring components with hover-based activation.
* [jQuery.htmlEncode](http://vistaprint.github.io/SkinnyJS/jquery.htmlEncode.html): Bare bones HTML encoding
* [jQuery.imageSize](http://vistaprint.github.io/SkinnyJS/jquery.imageSize.html): Some utilities for dealing with image sizes, async loading, and fitting images to a bounding box
* [jQuery.isVisibleKeyCode](http://vistaprint.github.io/SkinnyJS/jquery.isVisibleKeyCode.html): Extension to jQuery.Event which indicates if a keypress is a visible character (i.e. not a function or modifier key)
* [jQuery.msAjax](http://vistaprint.github.io/SkinnyJS/jquery.msAjax.html): Microsoft friendly AJAX. Handles the quirks of ASMX, WCF, DataJsonContractSerializer, Microsoft's JSON date format, and provides an interface identical to jQuery.ajax().
* [jQuery.ns](http://vistaprint.github.io/SkinnyJS/jquery.ns.html): Declare namespaces without boilerplate
* [jQuery.partialLoad](http://vistaprint.github.io/SkinnyJS/jquery.partialLoad.html): Works like jQuery.load, but is more intelligent about executing downloaded scripts (i.e. don't re-run scripts that are already loaded)
* [jQuery.postMessage](http://vistaprint.github.io/SkinnyJS/jquery.postMessage.html): Provides cross-document messaging support, works on all browsers to IE6 (without URL fragments and polling).
* [jQuery.proxyAll](http://vistaprint.github.io/SkinnyJS/jquery.proxyAll.html): Binds functions to their host object (like jQuery.proxy(), but for all functions declared as properties of an object at once)
* [jQuery.queryString](http://vistaprint.github.io/SkinnyJS/jquery.queryString.html): Parses querystrings (the opposite of jQuery.param())
* [jQuery.scrollAnchor](http://vistaprint.github.io/SkinnyJS/jquery.scrollAnchor.html): Smooth scrolling support for anchor elements with internal references.
* [jQuery.uncomment](http://vistaprint.github.io/SkinnyJS/jquery.uncomment.html): Allows lazy evaluation of HTML blobs by removing them from comment blocks.
* [jQuery.url](http://vistaprint.github.io/SkinnyJS/jquery.url.html): Parses and serializes URLs.

Skinny UI components
------------------

* [jQuery.menu](http://vistaprint.github.io/SkinnyJS/jquery.menu.html): A traditional hierarchical menu widget, designed from the ground up to be both touch and mouse friendly. TODO: Get existing docs from the wiki
* [jQuery.modalDialog](http://vistaprint.github.io/SkinnyJS/jquery.modalDialog.html): A powerful modal dialog system that works across all devices: TODO: Get existing docs from the wiki
* [jQuery.richTooltip](http://vistaprint.github.io/SkinnyJS/jquery.richTooltip.html): Responsive tooltips that support HTML content.

Dependencies
------------------

skinny.js libraries were designed to have minimal dependencies, and are not intended to be used as a bundle. For this reason, we don't provide a concatenated, minified version of the whole set of libraries. Take the libraries you need, include their dependencies, and concatenate/minify to your
heart's content using your own project's build system. 

### How do I know what dependencies my file has?
All dependencies in skinny.js plugins are marked at the top using the following syntax:

    /// <reference path="{path}" />

Origin
------------------
The libraires that comprise skinny.js were written at [Vistaprint](http://www.vistaprint.com).

Vistaprint empowers more than 15 million micro businesses and consumers annually with affordable, professional options to make an impression. With a unique business model supported by proprietary technologies, high-volume production facilities, and direct marketing expertise, Vistaprint offers a wide variety of products and services that micro businesses can use to expand their business. A global company, Vistaprint employs over 4,100 people, operates more than 25 localized websites globally and ships to more than 130 countries around the world. Vistaprint's broad range of products and services are easy to access online, 24 hours a day at www.vistaprint.com.