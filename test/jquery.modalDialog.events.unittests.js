$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

// Events unit test
describe("jquery.modalDialog", function () {
    var assert = chai.assert;

    describe("#create()", function () {
        it("should throw an exception when passed non-existent element", function () {
            assert.throws(function () {
                    $.modalDialog.create({
                        content: "#iDontExist"
                    });
                },
                "ModalDialog content not found");
        });
    });

    describe("ModalDialog", function () {
        it("should be able to shared a content node between two dialogs, as long as they aren't open at the same time", function (done) {
            var dialog = $.modalDialog.create({
                content: "#simpleDialog"
            });
            var dialog2;

            dialog
                .open()
                .then(function () {
                    return dialog.close();
                })
                .then(function () {
                    dialog2 = $.modalDialog.create({
                        content: "#simpleDialog"
                    });
                    return dialog2.open();
                })
                .then(function () {
                    return dialog2.close();
                })
                .then(function () {
                    assert.ok(true);
                    done();
                });
        });

        it("should resolve promises when calling open and close", function (done) {
            var dialog = $.modalDialog.create({
                content: "#simpleDialog"
            });

            dialog
                .open()
                .then(
                    function () {
                        var dialogRef = $.modalDialog.getCurrent();
                        assert.equal(dialogRef, dialog); // Current dialog refs match
                    },
                    function () {
                        assert.fail(); // promise was rejected for dialog.open() method 
                        done();
                    })
                .then(function () {
                    return dialog.close();
                })
                .then(function () {
                    done();
                });
        });
    });

    var describeForDialogType = function (dialogType, dialogSettings) {
        describe(dialogType, function () {
            it("should fire lifecycle events in the correct order", function (done) {
                var dialog = $.modalDialog.create(dialogSettings);
                var phase = 0;

                dialog.onbeforeopen.add(function () {
                    assert.equal(this, dialog, "Current dialog refs match: beforeopen");
                    assert.equal(phase, 0, "beforeopen");
                    phase++;
                });

                var beforeOpenHandler = function () {
                    assert.equal(this, dialog, "Current dialog refs match: global beforeopen");
                    assert.equal(phase, 1, "global beforeopen");
                    phase++;
                };

                $.modalDialog.onbeforeopen.add(beforeOpenHandler);

                dialog.onopen.add(function () {
                    assert.equal(this, dialog, "Current dialog refs match: open");
                    assert.equal(phase, 2, "open");
                    phase++;
                });

                var openHandler = function () {
                    assert.equal(this, dialog, "Current dialog refs match: global open");
                    assert.equal(phase, 3, "global open");
                    phase++;
                };

                $.modalDialog.onopen.add(openHandler);

                dialog.onbeforeclose.add(function () {
                    assert.equal(this, dialog, "Current dialog refs match: beforeclose");
                    assert.equal(phase, 4, "beforeclose");
                    phase++;
                });

                var beforeCloseHandler = function () {
                    assert.equal(this, dialog, "Current dialog refs match: global beforeclose");
                    assert.equal(phase, 5, "global beforeclose");
                    phase++;
                };

                $.modalDialog.onbeforeclose.add(beforeCloseHandler);

                dialog.onclose.add(function () {
                    assert.equal(this, dialog, "Current dialog refs match: close");
                    assert.equal(phase, 6, "close");
                    phase++;
                });

                var closeHandler = function () {
                    assert.equal(this, dialog, "Current dialog refs match: global close");
                    assert.equal(phase, 7, "global close");
                    phase++;
                };

                $.modalDialog.onclose.add(closeHandler);

                dialog
                    .open()
                    .then(function () {
                        assert.equal(this, dialog, "Ensure context of promise is the dialog");
                        return dialog.close();
                    })
                    .then(function () {
                        assert.equal(this, dialog, "Ensure context of promise is the dialog");

                        $.modalDialog.onbeforeopen.remove(beforeOpenHandler);
                        $.modalDialog.onopen.remove(openHandler);
                        $.modalDialog.onbeforeclose.remove(beforeCloseHandler);
                        $.modalDialog.onclose.remove(closeHandler);

                        done();
                    });
            });

            var ensureDialogCancellable = function (delay) {
                it("should close when cancel() method is called after " + delay + " ms", function (done) {
                    var dialog = $.modalDialog.create(dialogSettings);

                    dialog.onclose.add(function () {
                        done();
                    });

                    dialog.open();

                    // Queue this to run as soon as open is finished
                    setTimeout(function () {
                        dialog.cancel();
                    }, delay);
                });
            };

            ensureDialogCancellable(0);
            ensureDialogCancellable(10);
            ensureDialogCancellable(50);
            ensureDialogCancellable(300); // After close event finished
        });
    };

    describeForDialogType("ModalDialog", {
        content: "#simpleDialog"
    });

    describeForDialogType("IFrameDialog", {
        url: "content/jquery.modalDialog.iframeContent.html"
    });

    describeForDialogType("AjaxDialog", {
        url: "content/jquery.modalDialog.ajaxContent.html",
        ajax: true
    });

    describe("AjaxDialog", function () {
        it("should reject it's promise for a URL that returns 404", function (done) {
            var dialog = $.modalDialog.create({
                url: "/idontexist",
                ajax: true
            });
            var dialog2;

            dialog
                .open()
                .then(
                    function () {
                        assert.fail("Promise was resolved even though ajax URL was invalid");
                        done();
                    },
                    function () {
                        assert.ok(true, "Promise was rejected correctly");

                        // Verify that the state of the framework is not messed up from failing to load the previous dialog.
                        assert.ok(!$.modalDialog.getCurrent(), "There should be no current dialog");

                        dialog2 = $.modalDialog.create({
                            url: "content/jquery.modalDialog.ajaxContent.html",
                            ajax: true
                        });
                        return dialog2.open();
                    })
                .then(
                    function () {
                        assert.ok(true, "Second ajax dialog opened OK after first failed");
                        return dialog2.close();
                    },
                    function () {
                        assert.fail("Second dialog failed to open properly");
                        done();
                    })
                .then(
                    function () {
                        done();
                    });
        });
    });

    describe("IFrameDialog", function () {
        it("should reject it's promise for a URL that returns a 404", function (done) {
            var dialog = $.modalDialog.create({
                url: "/idontexist"
            });
            var dialog2;

            dialog
                .open()
                .then(
                    function () {
                        assert.fail("Promise was resolved even though iframe URL was invalid");
                        done();
                    },
                    function () {
                        assert.ok(true, "Promise was rejected correctly");
                        //done();

                        // Verify that the state of the framework is not messed up from failing to load the previous dialog.

                        dialog2 = $.modalDialog.create({
                            url: "content/jquery.modalDialog.iframeContent.html"
                        });
                        return dialog2.open();
                    })
                .then(
                    function () {
                        assert.ok(true, "Second iframe dialog opened OK after first failed");
                        return dialog2.close();
                    },
                    function () {
                        assert.fail("Second dialog failed to open properly");
                        done();
                    })
                .then(
                    function () {
                        done();
                    });
        });

        it("should resolve promises for open() and close()", function (done) {
            var dialog = $.modalDialog.create({
                url: "content/jquery.modalDialog.iframeContent.html"
            });

            dialog
                .open()
                .then(
                    function () {
                        assert.ok(true, "Dialog opened");
                        return dialog.close();
                    },
                    function () {
                        assert.fail("Dialog failed to open");
                        done();
                    })
                .then(
                    function () {
                        done();
                    });
        });
    });

});
