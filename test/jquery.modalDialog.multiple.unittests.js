 /*jshint quotmark:false */

 describe("jquery.modalDialog.multiple", function () {
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

    it("Ensure two different links can share a dialog content node", function (done) {
        var $link = $('<a href="#content" data-rel="modalDialog">link</a>');
        $link.appendTo("body");

        var $link2 = $('<a href="#content" data-rel="modalDialog">link</a>');
        $link2.appendTo("body");

        var $content = $('<div id="content" class="dialog-content">foobar</div>');
        $content.appendTo("body");

        var dialog;

        clickDialogLink($link)
            .then(function () {
                // capture the instance of the dialog so we can compare it later
                dialog = this;

                assert.isTrue(this.isOpen(), "Dialog is open");
                assert.equal(this.$contentContainer.text().trim(), "foobar");

                return this.close();
            })
            .then(function () {
                return clickDialogLink($link2);
            })
            .then(function () {

                assert.isTrue(this.isOpen(), "Dialog is open");
                assert.equal(this.$contentContainer.text().trim(), "foobar");

                return this.close();
            })
            .then(function () {
                return clickDialogLink($link);
            })
            .then(function () {

                assert.isTrue(this.isOpen(), "Dialog is open");
                assert.equal(this.$contentContainer.text().trim(), "foobar");

                return this.close();
            })
            .then(function () {

                $link.remove();
                $link2.remove();
                $content.remove();

                done();
            });
    });
});
