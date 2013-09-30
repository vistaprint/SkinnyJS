
QUnit.config.testTimeout = 1000000;

$(document).ready(function()
{
    function cleanup()
    {
        var dialog = $.modalDialog.getCurrent();
        if (dialog)
        {
            stop();

            dialog
                .close()
                .then(function()
                {
                    start();
                },
                function()
                {
                    throw new Error("Error cleaning up");
                });
        }
    }

    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;

    module(
        "jquery.modalDialog.events",
        {
            setup: cleanup,
            teardown: cleanup
        });

    asyncTest("Ensure content node can be shared between two dialogs", 1, function()
    {
        var dialog = $.modalDialog.create({ content: "#simpleDialog" });
        var dialog2;

        dialog
            .open()
            .then(function()
            {
                return dialog.close();
            })
            .then(function()
            {
                dialog2 = $.modalDialog.create({ content: "#simpleDialog" });
                return dialog2.open();
            })
            .then(function()
            {
                return dialog2.close();
            })
            .then(function() 
            {
                ok(true);
                start();
            });
    });

    asyncTest("Ensure node dialog open resolves promise", 1, function()
    {
        var dialog = $.modalDialog.create({ content: "#simpleDialog" });

        dialog
            .open()
            .then(
                function()
                {
                    var dialogRef = $.modalDialog.getCurrent();
                    equal(dialogRef, dialog, "Current dialog refs match");
                },
                function()
                {
                    ok(false, "promise was rejected for dialog.open() method");
                    start();
                })
            .then(function()
            {
                return dialog.close();
            })
            .then(function()
            {
                start();
            });
    });

    asyncTest("Ensure node dialog open fires lifecycle events", 8, function()
    {
        var dialog = $.modalDialog.create({ content: "#simpleDialog" });
        var phase = 0;

        dialog.onbeforeopen.add(function()
        {
            equal(this, dialog, "Current dialog refs match");
            equal(phase, 0);
            phase++;
        });

        dialog.onopen.add(function()
        {
            equal(this, dialog, "Current dialog refs match");
            equal(phase, 1);
            phase++;
        });

        dialog.onbeforeclose.add(function()
        {
            equal(this, dialog, "Current dialog refs match");
            equal(phase, 2);
            phase++;
        });

        dialog.onclose.add(function()
        {
            equal(this, dialog, "Current dialog refs match");
            equal(phase, 3);
            phase++;
        });

        dialog
            .open()
            .then(function()
            {
                return dialog.close();
            })
            .then(function()
            {
                start();
            });
    });

    test("Ensure node dialog throws exception when passed non-existent element", function()
    {
        QUnit.throws(function()
        {
            $.modalDialog.create({ content: "#iDontExist" });
        },
        "ModalDialog content not found");
    });

    asyncTest("Ensure ajax dialog rejects promise with 404", 3, function()
    {
        var dialog = $.modalDialog.create({ url: "/idontexist", ajax: true });
        var dialog2;

        dialog
            .open()
            .then(
                function()
                {
                    ok(false, "Promise was resolved even though ajax URL was invalid");
                    start();
                },
                function()
                {
                    ok(true, "Promise was rejected correctly");

                    // Verify that the state of the framework is not messed up from failing to load the previous dialog.
                    ok(!$.modalDialog.getCurrent(), "There should be no current dialog");

                    dialog2 = $.modalDialog.create({ url: "content/jquery.modalDialog.ajaxContent.html", ajax: true });
                    return dialog2.open();
                })
            .then(
                function()
                {
                    ok(true, "Second ajax dialog opened OK after first failed");
                    return dialog2.close();
                },
                function()
                {
                    ok(false, "Second dialog failed to open properly");
                    start();
                })
            .then(
                function()
                {
                    start();
                });
    });

    asyncTest("Ensure iframe dialog rejects promise with 404", 2, function()
    {
        var dialog = $.modalDialog.create({ url: "/idontexist" });
        var dialog2;

        dialog
            .open()
            .then(
                function()
                {
                    ok(false, "Promise was resolved even though iframe URL was invalid");
                    start();
                },
                function()
                {
                    ok(true, "Promise was rejected correctly");
                    //start();

                    // Verify that the state of the framework is not messed up from failing to load the previous dialog.

                    dialog2 = $.modalDialog.create({ url: "content/jquery.modalDialog.iframeContent.html" });
                    return dialog2.open();
                })
            .then(
                function()
                {
                    ok(true, "Second iframe dialog opened OK after first failed");
                    return dialog2.close();
                },
                function()
                {
                    ok(false, "Second dialog failed to open properly");
                    start();
                })
            .then(
                function()
                {
                    start();
                });
    });

    asyncTest("Ensure iframe dialog promises are fired", 1, function()
    {
        var dialog = $.modalDialog.create({ url: "content/jquery.modalDialog.iframeContent.html" });

        dialog
            .open()
            .then(
                function()
                {
                    ok(true, "Dialog opened");
                    return dialog.close();
                },
                function()
                {
                    ok(false, "Dialog failed to open");
                    start();
                })
            .then(
                function()
                {
                    start();
                });
    });

});

window.onerror = function(msg)
{
    window.console.log("Uncaught error: " + msg);
};