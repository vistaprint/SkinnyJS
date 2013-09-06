/*global asyncTest, ok, start*/

$(document).ready(function()
{
    function cleanup()
    {
        $("#contentContainer").empty();
    }

    module(
        "jquery.partialLoad",
        {
            setup: cleanup,
            teardown: cleanup
        });

    asyncTest("Ensure content is loaded with no scripts", 2, function()
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            "#interestingContent1", 
            function() 
            { 
                var content = $("#contentContainer").html();

                equal(content, "<div id=\"interestingContent1\">interesting content 1</div>");
                ok(typeof CONTENT_SCRIPT_GLOBAL1 == "undefined", "Ensure a script from an element other than the target is NOT executed");

                start();
            });
    });

    asyncTest("Ensure script in content is executed", 2, function()
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            "#withContentScript1", 
            function() 
            { 
                var content = $("#contentContainer .interesting-inner").html();

                equal(content, "with content script 1");
                ok(typeof CONTENT_SCRIPT_GLOBAL1 != "undefined", "Ensure a script from the current element is executed");

                start();
            });
    });

    asyncTest("Ensure inline script in content is executed", 2, function()
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            "#withInlineScript", 
            function() 
            { 
                var content = $("#contentContainer .interesting-inner").html();

                equal(content, "with inline script");
                ok(typeof INLINE_GLOBAL1 != "undefined", "Ensure an inline from the current element is executed");

                start();
            });
    });

    asyncTest("Ensure script in content is not executed if already loaded", 2, function()
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            "#withDuplicateScript", 
            function() 
            { 
                var content = $("#contentContainer .interesting-inner").html();

                equal(content, "with duplicate script");
                equal(window.CONTENT_SCRIPT_DEFINE_ONCE, 1, "Ensure a script from the current element is not executed because it is already loaded");

                start();
            });
    });

    asyncTest("Ensure script in content is not executed if already loaded, with no target selector", 2, function()
    {
        $("#contentContainer").partialLoad(
            "content/jquery.partialLoad.content.html", 
            function(g) 
            { 
                var content = $("#contentContainer #bodyContent .interesting-inner").html();

                equal(content, "body content", "Ensure all body content is loaded if no target selector is passed");
                equal(window.CONTENT_SCRIPT_DEFINE_ONCE, 1, "Ensure a script from the current element is not executed because it is already loaded");

                start();
            });
    });
});