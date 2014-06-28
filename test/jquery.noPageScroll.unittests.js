describe("jquery.noPageScroll", function() {
    var assert = chai.assert;

    it("Should prevent scrolling on mousewheel", function(done){
        var before = $("body").scrollTop();
        var scrollEvent = jQuery.Event( "mousewheel",{delta: -650} );
        $(".scrollable").on("mousewheel", function(e){
            $(".scrollable").noPageScroll(e);
            assert.equal(before, $("body").scrollTop(), "body scroll position should be unchanged");
            done();
        });
        $(".scrollable").trigger(scrollEvent);
    });
});