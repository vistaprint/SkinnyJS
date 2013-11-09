 /*jshint quotmark:false */

describe("jquery.modalDialog.unobtrusive", function() {
    var assert = chai.assert;

    $.modalDialog.iframeLoadTimeout = 1000;
    $.modalDialog.animationDuration = 100;

    var clickDialogLink = function($link) {
        var deferred = new $.Deferred();
        var openHandler = function() {
            $.modalDialog.onopen.remove(openHandler);
            deferred.resolveWith(this);
        };

        $.modalDialog.onopen.add(openHandler);

        $link.trigger("click");

        return deferred;
    };

    var ensureLinkOpensDialog = function(dialogType, linkAttributes) {
        it("Ensure unobtrusive link opens " + dialogType + " dialog", function(done) {
            var $link = $('<a ' + linkAttributes + ' data-rel="modalDialog">link</a>');
            $link.appendTo("body");

            var dialog;

            clickDialogLink($link)
                .then(function() {
                    // capture the instance of the dialog so we can compare it later
                    dialog = this;

                    assert.isTrue(this.isOpen(), "Dialog is open");
                    assert.equal(dialog, $.modalDialog.getCurrent(), "Ensure 'this' is the current dialog");

                    return this.close();
                })
                .then(function() {
                    return clickDialogLink($link);
                })
                .then(function() {
                    assert.isTrue(this.isOpen(), "Dialog is open");
                    assert.equal(dialog, this, "Ensure 'this' is the current dialog");
                    assert.equal(dialog, $.modalDialog.getCurrent(), "Ensure the same dialog was opened the second time the link was clicked");

                    return this.close();
                })
                .then(function() {
                    // Clean up
                    $link.remove();

                    done();
                });
        });
    };

    ensureLinkOpensDialog("node", 'href="#simpleDialog"');

    ensureLinkOpensDialog("iframe", 'href="content/jquery.modalDialog.iframeContent.html"');

    ensureLinkOpensDialog("ajax", 'href="content/jquery.modalDialog.ajaxContent.html" data-dialog-ajax="true"');

    //TODO this should be in its own unit test suite
    it("Ensure iframe dialog can be opened twice", function(done) {
        var dialog = $.modalDialog.create({
            url: "content/jquery.modalDialog.iframeContent.html"
        });

        dialog.open()
            .then(
                function() {
                    // capture the instance of the dialog so we can compare it later
                    dialog = this;

                    assert.isTrue(this.isOpen(), "Dialog is open");
                    assert.equal(dialog, $.modalDialog.getCurrent(), "Ensure 'this' is the current dialog");

                    return this.close();
                })
            .then(
                function() {
                    return dialog.open();
                })
            .then(
                function() {
                    assert.isTrue(this.isOpen(), "Dialog is open");
                    assert.equal(dialog, this, "Ensure 'this' is the current dialog");
                    assert.equal(dialog, $.modalDialog.getCurrent(), "Ensure the same dialog was opened the second time the link was clicked");

                    return this.close();
                },
                function(err) {
                    assert.fail("Error: " + err.message);

                    done();
                })
            .then(
                function() {
                    done();
                });
    });
});
