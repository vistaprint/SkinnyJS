/// <reference path="underscore.js" />
(function ($) {

    var prevent = function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.returnValue = false;
        return false;
    };

    //No Page Scroll plugin. The jQuery element collection should include
    //top-level container element which contains scrollable elements.
    //When a scrollable item in the container element is scrolled, the
    //page will not scroll when the end of that element is reached.
    $.fn.noPageScroll = function(e){
        var target = e.target;
        var eventType = e.type;

        if (eventType == "touchstart"){
            $("body").css("overflow", "hidden");
            return;
        } else if (eventType == "touchend"){
            $("body").css("overflow", "visible");
            return;
        }

        var delta = (eventType == "DOMMouseScroll" ? e.originalEvent.detail * -1 : e.originalEvent.wheelDelta / 4);
        var up = delta > 0;

        for (var i = 0; i < this.children().length; i++){
            var child = this.children()[i];
            if ($(child).find(target).length !== 0 || child == target){
                // I only care about the child that contains e.target
                if (child.scrollHeight > child.offsetHeight){
                    //If child is scrollable
                    if(!up && $(child).scrollTop() + $(child).innerHeight() - delta >= child.scrollHeight) {
                        //Scrolling down
                        $(child).scrollTop(child.scrollHeight);
                        return prevent(e);
                    } else if (up && $(child).scrollTop() - delta <= 0){
                        //Scrolling up
                        $(child).scrollTop(0);
                        return prevent(e);
                    }
                }
            }
        }
    };
})(jQuery);