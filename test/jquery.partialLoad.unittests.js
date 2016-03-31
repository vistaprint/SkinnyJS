/// <reference path="../js/jquery.partialLoad.js" />
/// <reference path="content/jquery.partialLoad.contentScriptLoadOnce.js" />
/// <reference path="content/somecss-alreadyloaded.css" />

 /* globals INLINE_GLOBAL1 */
 // re-add CONTENT_SCRIPT_GLOBAL1as a global once the sync loading of javascript is fixed for cross-origin
 mocha.setup({
     globals: ["CONTENT_SCRIPT_GLOBAL1", "INLINE_GLOBAL1"]
 });

 describe("jquery.partialLoad()", function () {
     this.timeout(6000);

     var assert = chai.assert;

     $("<div id=\"contentContainer\">").appendTo("body");

     function cleanup() {
         $("#contentContainer").empty();
     }

     beforeEach(cleanup);
     afterEach(cleanup);

     it("should load content from a page containing scripts, but not load the scripts if they're not in the target element", function (done) {
         $("#contentContainer").partialLoad(
             "/test/content/jquery.partialLoad.content.html",
             "#interestingContent1",
             function () {
                 var content = $("#contentContainer").html();

                 assert.equal(content, "<div id=\"interestingContent1\">interesting content 1</div>");
                 assert.isUndefined(window.CONTENT_SCRIPT_GLOBAL1, "Ensure a script from an element other than the target is NOT executed");

                 done();
             });
     });

     /*it("should load content from a page and execute scripts from the target element", function (done) {
         $("#contentContainer").partialLoad(
             "/test/content/jquery.partialLoad.content.html",
             "#withContentScript1",
             function () {
                 var content = $("#contentContainer .interesting-inner").html();

                 assert.equal(content, "with content script 1");
                 assert.isDefined(CONTENT_SCRIPT_GLOBAL1, "Ensure a script from the current element is executed");

                 done();
             });
     });*/

     it("should load content and execute inline scripts in the target element", function (done) {
         $("#contentContainer").partialLoad(
             "/test/content/jquery.partialLoad.content.html",
             "#withInlineScript",
             function () {
                 var content = $("#contentContainer .interesting-inner").html();

                 assert.equal(content, "with inline script");
                 assert.isDefined(INLINE_GLOBAL1, "Ensure an inline from the current element is executed");

                 done();
             });
     });

     it("should load content and not execute scripts in the target element if they are already loaded", function (done) {
         $("#contentContainer").partialLoad(
             "/test/content/jquery.partialLoad.content.html",
             "#withDuplicateScript",
             function () {
                 var content = $("#contentContainer .interesting-inner").html();

                 assert.equal(content, "with duplicate script");
                 assert.equal(window.CONTENT_SCRIPT_DEFINE_ONCE, 1, "Ensure a script from the current element is not executed because it is already loaded");

                 done();
             });
     });

     it("should load content and not execute scripts if they are already loaded, with no target selector specified", function (done) {
         $("#contentContainer").partialLoad(
             "/test/content/jquery.partialLoad.content.html",
             function () {
                 var content = $("#contentContainer #bodyContent .interesting-inner").html();

                 assert.equal(content, "body content", "Ensure all body content is loaded if no target selector is passed");
                 assert.equal(window.CONTENT_SCRIPT_DEFINE_ONCE, 1, "Ensure a script from the current element is not executed because it is already loaded");

                 done();
             });
     });

     it("should load content and remove meta, noscript, and link tags", function (done) {
         $("#contentContainer").partialLoad(
             "/test/content/jquery.partialLoad.contentWithMeta.html",
             function () {
                 var $content = $("#contentContainer");

                 assert.equal($content.find("meta").length, 0, "Should remove all meta tags");
                 assert.equal($content.find("link").length, 1, "Should remove all stylesheets that are not unique");
                 assert.equal($content.find("link").attr("href"), "/test/content/somecss.css", "Should leave unique stylesheet");
                 assert.equal($content.find("title").length, 1, "Should preserve title from content");
                 assert.equal($content.find("title").text(), "jquery.partialLoad test content");
                 done();
             });
     });
 });
 
 describe("jquery.partialLoadHtml()", function () {
     this.timeout(6000);

     var assert = chai.assert;

     $("<div id=\"contentContainer\">").appendTo("body");

     function cleanup() {
         $("#contentContainer").empty();
     }

     beforeEach(cleanup);
     afterEach(cleanup);

     it("should load content, but not return the scripts if they're not in the target element", function (done) {
         var scripts = [];
         var html = "<body><div id=\'interestingContent1\'><span class=\'interestingContentSpan\'></span></div><div id=\'withContentScript1\'><span class=\'withContentScript1Span\'></span><script src=\'contentScript.js\'></script></div></body>";
         $("#contentContainer").partialLoadHtml(html, scripts, "#interestingContent1");
         var content = $("#contentContainer").html();

         assert.equal(content, "<div id=\"interestingContent1\"><span class=\"interestingContentSpan\"></span></div>");
         assert.equal(scripts.length, 0, "scripts returned outside of the target element");

         done();
     });
     
     it("should load content, and return scripts if they're in the target element", function (done) {
         var scripts = [];
         var html = "<body><div id=\'interestingContent1\'><span class=\'interestingContentSpan\'></span></div><div id=\'withContentScript1\'><span class=\'withContentScript1Span\'></span><script src=\'contentScript.js\'></script></div></body>";
         $("#contentContainer").partialLoadHtml(html, scripts, "#withContentScript1");
         var content = $("#contentContainer").html();

         assert.equal(content, "<div id=\"withContentScript1\"><span class=\"withContentScript1Span\"></span></div>");
         assert.equal(scripts.length, 1, "incorrect number of scripts returned");
         assert.equal(scripts[0].src.indexOf("contentScript.js") >= 0, true, "incorrect scripts returned");

         done();
     });
     
     it("should load content, but not return duplicate scripts", function (done) {
         var html = "<body><div id=\'withContentScript2\'><script src=\'contentScript1.js\'></script><script src=\'contentScript2.js\'></script><script src=\'contentScript2.js\'></script></div></body>";
         var scripts = [];
         $("#contentContainer").partialLoadHtml(html, scripts, "#withContentScript2");

         assert.equal(scripts.length, 2, "incorrect number of scripts returned");
         assert.equal(scripts[0].src.indexOf("contentScript1.js") >= 0, true, "incorrect first script returned");
         assert.equal(scripts[1].src.indexOf("contentScript2.js") >= 0, true, "incorrect second script returned");

         done();
     });    
     
     it("should load content without a selector", function (done) {
         var html = "<body><div id=\'withContentScript2\'><script src=\'contentScript3.js\'></script><script src=\'contentScript3.js\'></script><script src=\'contentScript4.js\'></script></div></body>";
         var scripts = [];
         $("#contentContainer").partialLoadHtml(html, scripts);
         var content = $("#contentContainer").html();

         assert.equal(content, "<div id=\"withContentScript2\"></div>");
         assert.equal(scripts.length, 2, "incorrect number of scripts returned");
         assert.equal(scripts[0].src.indexOf("contentScript3.js") >= 0, true, "incorrect first script returned");
         assert.equal(scripts[1].src.indexOf("contentScript4.js") >= 0, true, "incorrect second script returned");

         done();
     });
 });
