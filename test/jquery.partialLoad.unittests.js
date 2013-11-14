 /* globals CONTENT_SCRIPT_GLOBAL1, INLINE_GLOBAL1 */
mocha.setup({
    globals: ["CONTENT_SCRIPT_GLOBAL1", "INLINE_GLOBAL1"]
});

describe("jquery.partialLoad()", function() {
    var assert = chai.assert;

    function cleanup() {
        $("#contentContainer").empty();
    }

    beforeEach(cleanup);
    afterEach(cleanup);

    it("should load content from a page containing scripts, but not load the scripts if they're not in the target element", function(done) {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html",
            "#interestingContent1",
            function() {
                var content = $("#contentContainer").html();

                assert.equal(content, "<div id=\"interestingContent1\">interesting content 1</div>");
                assert.isUndefined(window.CONTENT_SCRIPT_GLOBAL1, "Ensure a script from an element other than the target is NOT executed");

                done();
            });
    });

    it("should load content from a page and execute scripts from the target element", function(done) {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html",
            "#withContentScript1",
            function() {
                var content = $("#contentContainer .interesting-inner").html();

                assert.equal(content, "with content script 1");
                assert.isDefined(CONTENT_SCRIPT_GLOBAL1, "Ensure a script from the current element is executed");

                done();
            });
    });

    it("should load content and execute inline scripts in the target element", function(done) {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html",
            "#withInlineScript",
            function() {
                var content = $("#contentContainer .interesting-inner").html();

                assert.equal(content, "with inline script");
                assert.isDefined(INLINE_GLOBAL1, "Ensure an inline from the current element is executed");

                done();
            });
    });

    it("should load content and not execute scripts in the target element if they are already loaded", function(done) {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html",
            "#withDuplicateScript",
            function() {
                var content = $("#contentContainer .interesting-inner").html();

                assert.equal(content, "with duplicate script");
                assert.equal(window.CONTENT_SCRIPT_DEFINE_ONCE, 1, "Ensure a script from the current element is not executed because it is already loaded");

                done();
            });
    });

    it("should load content and not execute scripts if they are already loaded, with no target selector specified", function(done) {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html",
            function() {
                var content = $("#contentContainer #bodyContent .interesting-inner").html();

                assert.equal(content, "body content", "Ensure all body content is loaded if no target selector is passed");
                assert.equal(window.CONTENT_SCRIPT_DEFINE_ONCE, 1, "Ensure a script from the current element is not executed because it is already loaded");

                done();
            });
    });

    it("should load content and remove meta, noscript, and link tags", function(done) {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.contentWithMeta.html",
            function() {
                var $content = $("#contentContainer");

                assert.equal($content.find("meta").length, 0, "Should remove all meta tags");
                assert.equal($content.find("link").length, 1, "Should remove all stylesheets that are not unique");
                assert.equal($content.find("link").attr("href"), "content/somecss.css", "Should leave unique stylesheet");
                assert.equal($content.find("title").length, 1, "Should preserve title from content");
                assert.equal($content.find("title").text(), "jquery.partialLoad test content");
                done();
            });
    });
});
