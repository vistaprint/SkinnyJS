// iOS
// iOS has a bug where text fields in an iFrame misbehave if there are touch events assigned to the 
// host window. This fix disables them while iFrame dialogs are open.

(function ($) {
    var preventWindowTouchEvents = function (dialog, fix) {
        // The bug only affects iFrame dialogs
        if (dialog.dialogType != "iframe") {
            return;
        }

        $([window, document]).enableEvent("touchmove touchstart touchend", !fix);
    };

    var getWindowHeight = function () {
        return window.innerHeight || $(window).height();
    };

    var initializeShimming = function () {

        // Cache original values to restore when the dialog closes
        var _scrollTop = 0;
        var _height = 0;

        $.modalDialog.onbeforeopen.add(function () {
            if (this.level === 0) {
                // Cache scroll height and body height so we can restore them when the dialog is closed
                _scrollTop = $(document).scrollTop();
                _height = document.body.style.height;

                // HACK: setting the body to be larger than the screen height prevents the address bar from showing up in iOS
                document.body.style.height = (getWindowHeight() + 50) + "px";

                window.scrollTo(0, 1);
            }
        });

        $.modalDialog.onopen.add(function () {
            if (this.level === 0) {
                // Ensure the body/background is bigger than the dialog,
                // otherwise we see the background "end" above the bottom
                // of the dialog.
                var height = Math.max(this.$container.height(), getWindowHeight()) + 20;

                document.body.style.height = height + "px";
                $(".dialog-background").css({
                    height: height
                });

                window.scrollTo(0, 1);
            }
        });

        $.modalDialog.onclose.add(function () {
            if (this.level === 0) {
                // Restore body height, elements, and scroll position
                document.body.style.height = _height;

                window.scrollTo(0, _scrollTop);
            }
        });
    };

    $(function () {
        if (!$.modalDialog.isSmallScreen()) {
            return;
        }

        // Make the veil opaque
        $.modalDialog.veilClass = "dialog-veil-opaque";

        // This will run in a content window. They need the events disabled immediately.
        if ($.modalDialog && $.modalDialog._isContent) {
            var dialog = $.modalDialog.getCurrent();
            if (dialog) {
                $(window).on("load", function () {
                    preventWindowTouchEvents(dialog, true);
                });
            }
        } else {
            // This is for the host window.
            $.modalDialog.onopen.add(function () {
                preventWindowTouchEvents(this, true);
            });
            $.modalDialog.onbeforeclose.add(function () {
                preventWindowTouchEvents(this, false);
            });

            initializeShimming();
        }
    });

})(jQuery);
