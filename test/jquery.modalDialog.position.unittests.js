/// <reference path="jquery.modalDialog.setup.html" />
/// <reference path="jquery.modalDialog.setup.js" />

 /*jshint quotmark:false */

 // Scrollbars are messing up measurements of the window size
 $(document.body).css("overflow", "hidden");

 $.modalDialog.iframeLoadTimeout = 1000;
 $.modalDialog.animationDuration = 100;

 describe("jquery.modalDialog.position", function () {
     var assert = chai.assert;

     it("is centered when opened", function (done) {
         var dialog = $.modalDialog.create({
             content: "#vegDialog"
         });

         dialog.open()
             .then(
                 function () {
                     var rect = dialog.$container.clientRect();

                     var windowRect = {
                         width: $(window).width(),
                         height: $(window).height()
                     };

                     var expectedTop = Math.max((windowRect.height / 2) - (rect.height / 2), 10);

                     if ($.modalDialog.isSmallScreen()) {
                         expectedTop = 10;
                     }

                     assert.closeTo(rect.top, expectedTop, 1);

                     var expectedLeft = (windowRect.width / 2) - (rect.width / 2);
                     assert.closeTo(rect.left, expectedLeft, 1);

                     return dialog.close();
                 })
             .then(
                 function () {
                     done();
                 });
     });
 });

 describe("jquery.modalDialog._updateZIndexes", function () {
     var assert = chai.assert;

     it("will open a second dialog on top of its parent", function (done) {
         var $content1 = $('<div class="dialog-content">content1</div>').appendTo(document.body);
         var $content2 = $('<div class="dialog-content">content2</div>').appendTo(document.body);

         var dialog1 = $.modalDialog.create({
             content: $content1
         });
         var dialog2;

         dialog1.open()
             .then(
                 function () {
                     assert.ok(parseInt(dialog1.$bg.css("z-index"), 10) < parseInt(dialog1.$container.css("z-index"), 10));

                     dialog2 = $.modalDialog.create({
                         content: $content2
                     });
                     return dialog2.open();
                 })
             .then(
                 function () {
                     assert.ok(parseInt(dialog2.$bg.css("z-index"), 10) > parseInt(dialog1.$container.css("z-index"), 10));
                     assert.ok(parseInt(dialog2.$bg.css("z-index"), 10) < parseInt(dialog2.$container.css("z-index"), 10));

                     return dialog2.close();
                 })
             .then(
                 function () {
                     return dialog1.close();
                 })
             .then(
                 function () {
                     $content1.remove();
                     $content2.remove();
                     done();
                 });
     });

     it("will respect the zIndex settings option", function (done) {
         var $content = $('<div class="dialog-content">content1</div>').appendTo(document.body);
         var ZINDEX = 100;

         var dialog = $.modalDialog.create({
             content: $content,
             zIndex: ZINDEX
         });

         dialog.open()
             .then(
                 function () {
                     assert.equal(ZINDEX, parseInt(dialog.$bg.css("z-index"), 10));

                     return dialog.close();
                 })
             .then(
                 function () {
                     $content.remove();
                     done();
                 });
     });

     it("will respect the zIndex default if not specified in settings", function (done) {
         var $content = $('<div class="dialog-content">content1</div>').appendTo(document.body);

         var dialog = $.modalDialog.create({
             content: $content
         });

         dialog.open()
             .then(
                 function () {
                     assert.equal($.modalDialog.defaults.zIndex, parseInt(dialog.$bg.css("z-index"), 10));

                     return dialog.close();
                 })
             .then(
                 function () {
                     $content.remove();
                     done();
                 });
     });
 });
