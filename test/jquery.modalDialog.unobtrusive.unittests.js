/*jshint quotmark:false */

QUnit.config.testTimeout = 1000000;

$(document).ready(function()
{

    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;

    module("jquery.modalDialog.unobtrusive");

    var clickDialogLink = function($link)
    {
        var deferred = new $.Deferred();
        var openHandler = function()
        {
            $.modalDialog.onopen.remove(openHandler);
            deferred.resolveWith(this);
        };

        $.modalDialog.onopen.add(openHandler);

        $link.trigger("click");

        return deferred;
    };

    var ensureLinkOpensDialog = function(dialogType, linkAttributes)
    {
        asyncTest("Ensure unobtrusive link opens " + dialogType + " dialog", 5, function()
        {
            var $link = $('<a ' + linkAttributes + ' data-rel="modalDialog">link</a>');
            $link.appendTo("body");

            var dialog;

            clickDialogLink($link)
                .then(function()
                {
                    // capture the instance of the dialog so we can compare it later
                    dialog = this;

                    ok(this.isOpen(), "Dialog is open");
                    equal(dialog, $.modalDialog.getCurrent(), "Ensure 'this' is the current dialog");

                    return this.close();
                })
                .then(function()
                {
                    return clickDialogLink($link);
                })
                .then(function()
                {
                    ok(this.isOpen(), "Dialog is open");
                    equal(dialog, this, "Ensure 'this' is the current dialog");
                    equal(dialog, $.modalDialog.getCurrent(), "Ensure the same dialog was opened the second time the link was clicked");
                    
                    return this.close();
                })
                .then(function()
                {
                    // Clean up
                    $link.remove();

                    start();
                });
        });
    };

    ensureLinkOpensDialog("node", 'href="#simpleDialog"');

    ensureLinkOpensDialog("iframe", 'href="content/jquery.modalDialog.iframeContent.html"');

    ensureLinkOpensDialog("ajax", 'href="content/jquery.modalDialog.ajaxContent.html" data-dialog-ajax="true"');

    //TODO this should be in its own unit test suite
    asyncTest("Ensure iframe dialog can be opened twice", 5, function()
    {
        var dialog = $.modalDialog.create({ url: "content/jquery.modalDialog.iframeContent.html" });

        dialog.open()
            .then(
                function()
                {
                    // capture the instance of the dialog so we can compare it later
                    dialog = this;

                    ok(this.isOpen(), "Dialog is open");
                    equal(dialog, $.modalDialog.getCurrent(), "Ensure 'this' is the current dialog");

                    return this.close();
                })
            .then(
                function()
                {
                    return dialog.open();
                })
            .then(
                function()
                {
                    ok(this.isOpen(), "Dialog is open");
                    equal(dialog, this, "Ensure 'this' is the current dialog");
                    equal(dialog, $.modalDialog.getCurrent(), "Ensure the same dialog was opened the second time the link was clicked");
                    
                    return this.close();
                },
                function(err)
                {
                    ok(false, "Error: " + err.message);
                    
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