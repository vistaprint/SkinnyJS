describe('jquery.pointerEvents', function () {
    var el = $('#test');

    function test(pointerEvent, nativeEvents) {
        var groovy = false,
            teardown = true;

        function workIt() {
            if (groovy) {
                chai.assert.fail();
                teardown = false;
            }

            groovy = true;
        }

        // bind to the pointer event
        el.on(pointerEvent, workIt);

        // run all the native events that map to this pointer event
        $.each(nativeEvents, function (i, nativeEvent) {
            it('should call a ' + pointerEvent + ' when a ' + nativeEvent + ' is triggered', function () {
                // reset groovy here for this next test
                groovy = false;

                // trigger native event, should trigger the pointer event and call workIt
                el.triggerNative(nativeEvent);

                // confirm workIt was called
                chai.assert.equal(groovy, true);
            });

            // we have a special case for the touchstart to prevent mousedown
            if (pointerEvent == 'pointerdown' && nativeEvent == 'touchstart') {
                it('calling touchstart should prevent the next mousedown event', function () {
                    groovy = false;
                    el.triggerNative('mousedown');
                    chai.assert.equal(groovy, false);
                });
            }
        });

        // ensure that you can teardown (unbind) the pointer event
        it('teardown ' + pointerEvent, function () {
            el.off(pointerEvent, workIt);

            $.each(nativeEvents, function (i, nativeEvent) {
                el.triggerNative(nativeEvent);
            });

            chai.assert.equal(teardown, true);
        });
    }

    describe('pointerdown', function () {
        test('pointerdown', ['mousedown', 'touchstart']);
    });

    describe('pointerup', function () {
        test('pointerup', ['touchend', 'mouseup']);
    });

    describe('pointermove', function () {
        test('pointermove', ['touchmove', 'mousemove']);
    });

    describe('hover (pointerover, pointerout)', function () {
        test('pointerover', ['mouseover']);
        test('pointerout', ['mouseout']);
    });
});
