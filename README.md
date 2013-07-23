skinny.js: Slim little jQuery plugins [![Build Status](https://secure.travis-ci.org/labaneilers/SkinnyJS.png?branch=master)](http://travis-ci.org/labaneilers/SkinnyJS)
===========================================
skinny.js is a collection of jQuery plugins that are useful for building web applications. Its design is a response to having used too many JavaScript frameworks that require you to buy into a particular philosophy, coding style, or architecture. Instead, skinny.js embraces the single responsibility principle, and aims to create tiny, granular libraries with minimal dependencies.

skinny.js libraries depend only on jQuery, and in a few cases, each other. They are not intended to be used as a bundle; so if you need one library, you are encouraged to use only it and its dependencies.

Skinny libraries
----------
* jQuery.partialLoad: Works like jQuery.load, but is more intelligent about executing downloaded scripts (i.e. don't re-run scripts that are already loaded)
* jQuery.clientRect: Efficient
* jQuery.delimitedString: Base class for parsing delimited strings, such as querystrings or CSS styles
* jQuery.queryString: Parses querystrings (the opposite of jQuery.param())
* jQuery.css: Parses and serializes CSS style strings
* jQuery.url: Parses and serializes URLs.
* jQuery.disableEvent: Temporarily disables/enables all event handlers for a DOM element
* jQuery.hostIframe: Manages references between iframe content and their host window
* jQuery.hoverDelay: Simplified, more practical version of jQuery.hoverIntent plugin. TODO reference
* jQuery.htmlEncode: Bare bones HTML encoding
* jQuery.imageSize: Some utilities for dealing with image sizes, async loading, and fitting images to a bounding box
* jQuery.isVisibleKeyCode: Extension to jQuery.Event which indicates if a keypress is a visible character (i.e. not a function or modifier key)
* jQuery.msAjax: Microsoft freindly AJAX. Handles the quirks of ASMX, WCF, DataJsonContractSerializer, Microsoft's JSON date format, and provides an interface identical to jQuery.ajax().
* jQuery.ns: Declare namespaces without boilerplate
* jQuery.postMessage: Provides cross-document messaging support, works on all browsers to IE6 (without URL fragments and polling).
* jQuery.proxyAll: Binds functions to their host object (like jQuery.proxy(), but for all functions declared as properties of an object at once)
* jQuery.uncomment: Allows lazy evaluation of HTML blobs by removing them from comment blocks
* jQuery.customEvent: TODO
* jQuery.cookie: TODO

Skinny UI components
----------
* jQuery.menu: A traditional heirarchical menu widget, designed from the ground up to be both touch and mouse friendly. TODO: Get existing docs from the wiki
* jQuery.modalDialog: A powerful modal dialog system that works across all devices: TODO: Get existing docs from the wiki