/// <reference path="jquery.modalDialog.setup.html" />
/// <reference path="jquery.modalDialog.setup.js" />

 /*jshint quotmark:false */

 describe("jquery.modalDialog.unobtrusive", function () {
    var assert = chai.assert;

    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;

    var clickDialogLink = function ($link) {
         var deferred = new $.Deferred();
         var openHandler = function () {
             $.modalDialog.onopen.remove(openHandler);
             deferred.resolveWith(this);
         };

         $.modalDialog.onopen.add(openHandler);

         $link.trigger("click");

         return deferred;
     };

     var ensureLinkOpensDialog = function (dialogType, linkAttributes, secondHref, verify) {
         it("will open an unobtrusive link for a " + dialogType + " dialog", function (done) {
             var $link = $('<a ' + linkAttributes + ' data-rel="modalDialog">link</a>');
             $link.appendTo("body");

             var dialog;

             clickDialogLink($link)
                 .then(function () {
                     // capture the instance of the dialog so we can compare it later
                     dialog = this;

                     assert.isTrue(this.isOpen(), "Dialog is open");
                     assert.equal(dialog, $.modalDialog.getCurrent(), "Ensure 'this' is the current dialog");

                     return this.close();
                 })
                 .then(function () {
                     return clickDialogLink($link);
                 })
                 .then(function () {
                     assert.isTrue(this.isOpen(), "Dialog is open");
                     assert.equal(dialog, this, "Ensure 'this' is the current dialog");
                     assert.equal(dialog, $.modalDialog.getCurrent(), "Ensure the same dialog was opened the second time the link was clicked");

                     return this.close();
                 })
                 .then(function() {
                    $link.attr("href", secondHref);
                    return clickDialogLink($link);
                 })
                 .then(function() {
                    var dialog2 = this;

                    assert.notEqual(dialog, dialog2);
                    verify(dialog2);

                    return dialog2.close();
                 })
                 .then(function () {
                     // Clean up
                     $link.remove();

                     done();
                 });
         });
     };

     ensureLinkOpensDialog("node", 'href="#simpleDialog"', "#simpleDialog2", function (dialog) {
        assert.equal(dialog.settings.content[0], $("#simpleDialog2")[0]);
     });

     ensureLinkOpensDialog(
        "iframe", 
        'href="/test/content/jquery.modalDialog.iframeContent.html"',
        "/test/content/jquery.modalDialog.iframeContent.html?second=1",
        function (dialog) {
            assert.equal(dialog.settings.url, "/test/content/jquery.modalDialog.iframeContent.html?second=1");
        });

     ensureLinkOpensDialog(
        "ajax",
        'href="/test/content/jquery.modalDialog.ajaxContent.html" data-dialog-ajax="true"',
        "/test/content/jquery.modalDialog.ajaxContent.html?second=1",
        function (dialog) {
            assert.equal(dialog.settings.url, "/test/content/jquery.modalDialog.ajaxContent.html?second=1");
        });

     //TODO this should be in its own unit test suite
     it("will open an iframe twice", function (done) {
         var dialog = $.modalDialog.create({
             url: "/test/content/jquery.modalDialog.iframeContent.html"
         });

         dialog.open()
             .then(
                 function () {
                     // capture the instance of the dialog so we can compare it later
                     dialog = this;

                     assert.isTrue(this.isOpen(), "Dialog is open");
                     assert.equal(dialog, $.modalDialog.getCurrent(), "Ensure 'this' is the current dialog");

                     return this.close();
                 })
             .then(
                 function () {
                     return dialog.open();
                 })
             .then(
                 function () {
                     assert.isTrue(this.isOpen(), "Dialog is open");
                     assert.equal(dialog, this, "Ensure 'this' is the current dialog");
                     assert.equal(dialog, $.modalDialog.getCurrent(), "Ensure the same dialog was opened the second time the link was clicked");

                     return this.close();
                 },
                 function (err) {
                     assert.fail("Error: " + err.message);

                     done();
                 })
             .then(
                 function () {
                     done();
                 });
     });

     it("will use data-dialog-url if present", function (done) {
         var $link = $('<a href="noscript-url.html" data-dialog-url="/test/content/jquery.modalDialog.iframeContent.html?datalink=1" data-rel="modalDialog">link</a>');
         $link.appendTo("body");

         var dialog;

         clickDialogLink($link)
             .then(function () {
                 // capture the instance of the dialog so we can compare it later
                 dialog = this;

                 assert.equal(dialog.settings.url, "/test/content/jquery.modalDialog.iframeContent.html?datalink=1");

                 return this.close();
             })
             .then(function () {
                 // Clean up
                 $link.remove();

                 done();
             });
     });
 });
