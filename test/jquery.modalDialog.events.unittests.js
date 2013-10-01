
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

    var ensureLifecycleEvents = function(dialogType, dialogSettings)
    {
        asyncTest("Ensure " + dialogType + " dialog fires lifecycle events", 16, function()
        {
            var dialog = $.modalDialog.create(dialogSettings);
            var phase = 0;

            dialog.onbeforeopen.add(function()
            {
                equal(this, dialog, "Current dialog refs match: beforeopen");
                equal(phase, 0, "beforeopen");
                phase++;
            });

            var beforeOpenHandler = function()
            {
                equal(this, dialog, "Current dialog refs match: global beforeopen");
                equal(phase, 1, "global beforeopen");
                phase++;
            };

            $.modalDialog.onbeforeopen.add(beforeOpenHandler);

            dialog.onopen.add(function()
            {
                equal(this, dialog, "Current dialog refs match: open");
                equal(phase, 2, "open");
                phase++;
            });

            var openHandler = function()
            {
                equal(this, dialog, "Current dialog refs match: global open");
                equal(phase, 3, "global open");
                phase++;
            };

            $.modalDialog.onopen.add(openHandler);

            dialog.onbeforeclose.add(function()
            {
                equal(this, dialog, "Current dialog refs match: beforeclose");
                equal(phase, 4, "beforeclose");
                phase++;
            });

            var beforeCloseHandler = function()
            {
                equal(this, dialog, "Current dialog refs match: global beforeclose");
                equal(phase, 5, "global beforeclose");
                phase++;
            };

            $.modalDialog.onbeforeclose.add(beforeCloseHandler);

            dialog.onclose.add(function()
            {
                equal(this, dialog, "Current dialog refs match: close");
                equal(phase, 6, "close");
                phase++;
            });

            var closeHandler = function()
            {
                equal(this, dialog, "Current dialog refs match: global close");
                equal(phase, 7, "global close");
                phase++;
            };

            $.modalDialog.onclose.add(closeHandler);

            dialog
                .open()
                .then(function()
                {
                    return dialog.close();
                })
                .then(function()
                {
                    $.modalDialog.onbeforeopen.remove(beforeOpenHandler);
                    $.modalDialog.onopen.remove(openHandler);
                    $.modalDialog.onbeforeclose.remove(beforeCloseHandler);
                    $.modalDialog.onclose.remove(closeHandler);

                    start();
                });
        });
    };

    ensureLifecycleEvents("node", { content: "#simpleDialog" });

    ensureLifecycleEvents("iframe", { url: "content/jquery.modalDialog.iframeContent.html" });

    ensureLifecycleEvents("ajax", { url: "content/jquery.modalDialog.ajaxContent.html", ajax: true });

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