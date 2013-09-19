
$(document).ready(function()
{
    function cleanup()
    {
        var dialog = $.modalDialog.getCurrent();
        if (dialog)
        {
            dialog.close();
            stop();
        }
    }

    module(
        "jquery.modalDialog.events",
        {
            setup: cleanup,
            teardown: cleanup
        });

    // test("Ensure content node can be shared between two dialogs", function()
    // {
    //     var dialog = $.modalDialog.create({ content: "#simpleDialog" });

    //     dialog.open();

    //     var dialog2 = $.modalDialog.create({ content: "#simpleDialog" });

    //     dialog2.open();

    //     expect(0);
    // });

    asyncTest("Ensure node dialog open resolves promise", 1, function()
    {
        var dialog = $.modalDialog.create({ content: "#simpleDialog" });


        dialog.open()
            .done(function()
            {
                var dialogRef = $.modalDialog.getCurrent();
                equal(dialogRef, dialog, "Current dialog refs match");

                start();
            })
            .fail(function()
            {
                ok(false, "promise was rejcted for dialog.open() method");
                start();
            });
    });

    // asyncTest("Ensure node dialog open fires onopen", 1, function()
    // {
    //     var dialog = $.modalDialog.create({ content: "#simpleDialog" });

    //     dialog.onopen.add(function()
    //     {
    //         equal(this, dialog, "Current dialog refs match");

    //         setTimeout(start, 0);
    //     });

    //     dialog.open();
    // });

    // test("Ensure node dialog throws exception when passed non-existent element", function()
    // {
    //     throws(function()
    //     {
    //         $.modalDialog.create({ content: "#iDontExist" });
    //     },
    //     "ModalDialog content not found");
        
    // });

});