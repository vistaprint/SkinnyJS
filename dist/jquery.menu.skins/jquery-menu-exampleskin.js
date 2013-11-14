(function ($) {
    var TRANSITION_TIME = 300;

    $.registerDropDownMenuSkin(
        "exampleskin", {
            position: function (e) {
                if (e.level === 0) {
                    e.$panel.css({
                        top: e.$item.innerHeight(),
                        left: "-" + e.$item.css("borderLeftWidth")
                    });
                    return;
                }

                var pos = e.$item.position();

                e.$panel.css({
                    left: pos.left + e.$item.innerWidth(),
                    top: 0
                });
            },

            animationShow: function (e, callback) {
                //            if (e.level === 0)
                //            {
                //                e.$panel.slideDown(TRANSITION_TIME, callback);
                //                return;
                //            }

                e.$panel.fadeIn(TRANSITION_TIME, callback);
            },

            animationHide: function (e, callback) {
                //            if (e.level === 0)
                //            {
                //                e.$panel.slideUp(TRANSITION_TIME, callback);
                //                return;
                //            }

                e.$panel.fadeOut(TRANSITION_TIME, callback);
            }
        });

})(jQuery);
