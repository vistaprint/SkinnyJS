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

});