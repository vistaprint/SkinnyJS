(function($) {

    // Scales and positions an image so that it totally fills the container specified by the "closestSelector",
    // it crops, rather than stretches, the image. The container should have overflow:hidden.
    // @param {String} src The URL of the image to load
    // @param {Object} closestSelector jQuery selector to determine the container to fill
    // @param {Function} callback Optional callback once image has been resized
    $.fn.fillClosest = function(src, closestSelector, callback) {
        this.each(function() {
            var img = this;

            var callbackWrapper = function(size) {
                var css = fillClosest.call(img, size, closestSelector);
                $(img).css(css);

                if (callback) {
                    callback.call(img, size);
                }
            };

            $.naturalSize(src, callbackWrapper);
        });

        this.attr("src", src);

        return this;
    };

    var fillClosest = function(rect, closestSelector) {
        var aspectRatio = rect.width / rect.height;
        var $container = $(this).closest(closestSelector);
        var containerHeight = $container.height();
        var containerWidth = $container.width();
        var containerAspectRatio = containerWidth / containerHeight;
        var scale;
        var margin = 0;

        // The container is skinnier than the image so we need to move the image to the left
        if (containerAspectRatio < aspectRatio) {
            scale = Math.round(aspectRatio / containerAspectRatio * 100);

            if (scale > 100) {
                margin = Math.round((scale - 100) / 2);
            }

            return {
                "margin-top": 0,
                "margin-left": -margin + "%",
                "width": scale + "%"
            };
        }
        // The container is fatter than the image so we need to move the image up
        else {
            scale = Math.round(containerAspectRatio / aspectRatio * 100);

            if (scale > 100) {
                margin = Math.round((scale - 100) / 2);
            }

            return {
                "margin-left": 0,
                "margin-top": -margin + "%",
                "width": "100%"
            };
        }
    };

    // Scales and resizes an image DOM element so that it fits and is centered in a box with the specified width
    // and height. 
    // src: The URL of the image to load
    // boundingBox: A rectangle with the maximum width and height
    // callback: Optional callback once image has been resized
    $.fn.fitToBoundingBox = function(src, boundingBox, callback, error) {
        this.each(function() {
            var img = this;

            var callbackWrapper = function(size) {
                var boundedSize = $.fitToBoundingBox(size, boundingBox);
                $(img).css(boundedSize);

                if (callback) {
                    callback.call(img, boundedSize);
                }
            };

            $.naturalSize(src, callbackWrapper, error);
        });

        this.attr("src", src);

        return this; // TODO can this return a promise?
    };

    $.fitToBoundingBox = function(rect, boundingBox) {
        var aspectRatio = rect.width / rect.height;
        return $.rectWithAspectRatio(boundingBox, aspectRatio);
    };

    // Preloads the specified image and calls back the specified function 
    // with a size (width/height) representing the intrinsic size of the image.
    // src: The URL of the image to load
    // success: A function that takes a size object as its only argument
    // error: A function will be called if there is an error loading the image.
    $.naturalSize = function(src, success, error) {
        var deferred = new $.Deferred();

        var img = new Image();

        var successWrapper = function() {
            // HACK for IE7- With images that are cached, IE7
            // fires image load events synchronously in the .src setter.
            // The setter blocks while the onload event handlers execute, which can cause
            // strange behavior in the caller of this method.
            // Simulate behavior of other browsers by manually queuing the callback.
            window.setTimeout(
                function() {
                    var size = {
                        width: img.width,
                        height: img.height
                    };

                    deferred.resolveWith(this, [size]);

                    if (success) {
                        success(size);
                    }
                },
                0);
        };

        img.onload = successWrapper;
        img.onerror = function(e) {
            deferred.reject(e);

            if (error) {
                error(e);
            }
        };

        img.src = src;

        return deferred;
    };

    // Finds the maximum rectangle size that can fit in the specified container rectangle
    // using the specified aspect ratio.
    $.rectWithAspectRatio = function(containerRect, aspectRatio) {
        var rect = {
            top: 0,
            left: 0,
            width: containerRect.width,
            height: containerRect.height
        };

        var containerAspectRatio = containerRect.width / containerRect.height;

        if (containerAspectRatio < aspectRatio) {
            rect.height = Math.round(rect.width / aspectRatio);
        } else {
            rect.width = Math.round(rect.height * aspectRatio);
        }

        rect.left = (containerRect.width - rect.width) / 2;
        rect.top = (containerRect.height - rect.height) / 2;
        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;

        return rect;
    };

})(jQuery);
