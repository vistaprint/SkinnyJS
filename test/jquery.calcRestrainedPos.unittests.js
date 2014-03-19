describe('jquery.calcRestrainedPos', function () {
    describe('$.doBoundingBoxesIntersect', function () {
        function rect(width, height, x, y) {
            return {
                left: x || 0,
                top: y || 0,
                width: width,
                height: height || width
            };
        }

        var intersects = $.doBoundingBoxesIntersect;

        it('should intersect', function () {
            // while at cords 0,0
            chai.assert.ok(intersects(rect(10), rect(5)));
            chai.assert.ok(intersects(rect(10), rect(15)));
            chai.assert.ok(intersects(rect(10), rect(1)));

            // offset cords
            chai.assert.ok(intersects(rect(10, 10, 50, 50), rect(100, 100)));
            chai.assert.ok(intersects(rect(10, 10, 50, 50), rect(50, 50, 25, 25)));

            // corners almost touch
            chai.assert.ok(intersects(rect(10, 10), rect(1, 1, 9, 9)), 'corners touch');
        });

        it('should not intersect', function () {
            chai.assert.notOk(intersects(rect(10), rect(0)), 'should fail when a box has no width or height');
            chai.assert.notOk(intersects(rect(10), rect(1, 1, 10, 10)));
            chai.assert.notOk(intersects(rect(1, 1, 10, 10), rect(10)));

            // corners touching
            chai.assert.notOk(intersects(rect(5, 5, 5, 5), rect(5, 5, 10, 0)), 'top-right corners touch');
            chai.assert.notOk(intersects(rect(5, 5, 5, 5), rect(5, 5, 10, 10)), 'bottom-right corners touch');
            chai.assert.notOk(intersects(rect(5, 5, 5, 5), rect(5, 5, 0, 10)), 'bottom-left corners touch');
            chai.assert.notOk(intersects(rect(5, 5, 5, 5), rect(5, 5)), 'top-left corners touch');
        });

        it('test intersection on all axis', function () {
            function aabb(pos, dim) {
                return {
                    left: pos[0],
                    top: pos[1],
                    width: dim[0],
                    height: dim[1]
                };
            }

            var b0 = aabb([10, 10], [10, 10]);
            var b1 = aabb([0, 0], [2, 2]);

            chai.assert.notOk(intersects(b0, b1), 'should not intersect (either axis)');

            b1 = aabb([0, 0], [20, 2]);
            chai.assert.notOk(intersects(b0, b1), 'should not intersect (x intersects)');

            b1 = aabb([0, 0], [2, 20]);
            chai.assert.notOk(intersects(b0, b1), 'should not intersect (y intersects)');

            b1 = aabb([21, 20], [20, 20]);
            chai.assert.notOk(intersects(b0, b1), 'should not intersect (y intersects base)');

            b1 = aabb([20, 21], [20, 20]);
            chai.assert.notOk(intersects(b0, b1), 'should not intersect (x intersects base)');

            // b1 = aabb([20, 20], [20, 20]);
            // chai.assert.ok(intersects(b0, b1), 'should intersect (b0 touches b1)');

            b1 = aabb([12, 12], [4, 4]);
            chai.assert.ok(intersects(b0, b1), 'should intersect (b0 contains b1)');
        });
    });
});
