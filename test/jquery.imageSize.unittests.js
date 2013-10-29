describe("jquery.imageSize plugin", function()
{
    var assert = chai.assert;

    describe("jquery.naturalSize()", function()
    {
        it("should resolve a promise with the size of the specified image", function(done)
        {
            $.naturalSize("../images/clock.gif")
                .then(function(size)
                {
                    assert.deepEqual(size, { width: 49, height: 50 });
                    done();
                });
        });

        it("should call the callback with the size of the specified image", function(done)
        {
            var callback = function(size)
            {
                assert.deepEqual(size, { width: 49, height: 50 });
                    done();
            };

            $.naturalSize("../images/clock.gif", callback);
        });

        it("should call the error callback when passed a non-existent image", function(done)
        {
            var callback = function()
            {
                assert.fail("should not be called");
            };

            var error = function()
            {
                assert.ok("Error callback");
                done();
            };

            $.naturalSize("../images/i-dont-exist.gif", callback, error);
        });

        it("should reject the promise when passed a non-existent image", function(done)
        {
            $.naturalSize("../images/i-dont-exist.gif")
                .then(function()
                {
                    assert.fail("should not be called");
                },
                function()
                {
                    assert.ok("Error callback");
                    done();
                });
        });
    });

    describe("jquery.rectWithAspectRatio()", function()
    {
        it("should fit a rect with a low aspect ratio into its container", function()
        {
            var rect = $.rectWithAspectRatio({ top: 0, left: 0, width: 100, height: 100}, 0.5);

            assert.equal(rect.top, 0);
            assert.equal(rect.left, 25);
            assert.equal(rect.width, 50);
            assert.equal(rect.height, 100);
        });

        it("should fit a rect with a high aspect ratio into its container", function()
        {
            var rect = $.rectWithAspectRatio({ top: 0, left: 0, width: 100, height: 100}, 2);

            assert.equal(rect.top, 25);
            assert.equal(rect.left, 0);
            assert.equal(rect.width, 100);
            assert.equal(rect.height, 50);
        });

        it("should fit a rect with an aspect ratio of 1 completely into its container", function()
        {
            var rect = $.rectWithAspectRatio({ top: 0, left: 0, width: 100, height: 100}, 1);

            assert.equal(rect.top, 0);
            assert.equal(rect.left, 0);
            assert.equal(rect.width, 100);
            assert.equal(rect.height, 100);
        });
    });

    describe("jquery.fitToBoundingBox()", function()
    {
        it("should set an element's rect to match the specified image fit to the specified bounding box", function(done)
        {
            var $div = $("<img />").css("position", "absolute");

            var callback = function()
            {
                $div.appendTo("body");

                assert.equal($div.offset().top, 0);
                assert.closeTo($div.offset().left, 25, 0.5); // Some browsers support fractional pixel values, others don't
                assert.equal($div.width(), 49); 
                assert.equal($div.height(), 50);

                $div.remove();

                done();
            };

            $div.fitToBoundingBox("../images/clock.gif", { width: 100, height: 50 }, callback);

            
        });
    });


});