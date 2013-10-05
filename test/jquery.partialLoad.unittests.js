/* globals CONTENT_SCRIPT_GLOBAL1, INLINE_GLOBAL1 */
mocha.setup({globals: ["CONTENT_SCRIPT_GLOBAL1", "INLINE_GLOBAL1"]});

describe("jquery.partialLoad", function()
{
    var assert = chai.assert;

    function cleanup()
    {
        $("#contentContainer").empty();
    }

    beforeEach(cleanup);
    afterEach(cleanup);

    it("Ensure content is loaded with no scripts", function(done)
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            "#interestingContent1", 
            function() 
            { 
                var content = $("#contentContainer").html();

                assert.equal(content, "<div id=\"interestingContent1\">interesting content 1</div>");
                assert.isUndefined(window.CONTENT_SCRIPT_GLOBAL1, "Ensure a script from an element other than the target is NOT executed");

                done();
            });
    });

    it("Ensure script in content is executed", function(done)
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            "#withContentScript1", 
            function() 
            { 
                var content = $("#contentContainer .interesting-inner").html();

                assert.equal(content, "with content script 1");
                assert.isDefined(CONTENT_SCRIPT_GLOBAL1, "Ensure a script from the current element is executed");

                done();
            });
    });

    it("Ensure inline script in content is executed", function(done)
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            "#withInlineScript", 
            function() 
            { 
                var content = $("#contentContainer .interesting-inner").html();

                assert.equal(content, "with inline script");
                assert.isDefined(INLINE_GLOBAL1, "Ensure an inline from the current element is executed");

                done();
            });
    });

    it("Ensure script in content is not executed if already loaded", function(done)
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            "#withDuplicateScript", 
            function() 
            { 
                var content = $("#contentContainer .interesting-inner").html();

                assert.equal(content, "with duplicate script");
                assert.equal(window.CONTENT_SCRIPT_DEFINE_ONCE, 1, "Ensure a script from the current element is not executed because it is already loaded");

                done();
            });
    });

    it("Ensure script in content is not executed if already loaded, with no target selector", function(done)
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            function() 
            { 
                var content = $("#contentContainer #bodyContent .interesting-inner").html();

                assert.equal(content, "body content", "Ensure all body content is loaded if no target selector is passed");
                assert.equal(window.CONTENT_SCRIPT_DEFINE_ONCE, 1, "Ensure a script from the current element is not executed because it is already loaded");

                done();
            });
    });
});