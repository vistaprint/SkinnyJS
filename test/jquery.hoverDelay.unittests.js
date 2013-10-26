describe("jquery.hoverDelay", function()
{
	var assert = chai.assert;

	mocha.globals(["_globalButtonHover","_globalButtonOut"]);

	var _$button;

	var basicButtonElement = function() {
		_$button = $("<button>button</button").appendTo(document.body);
		return _$button;
	};

	afterEach(function() {
		_$button.remove();
		
		delete window._globalButtonHover;
		delete window._globalButtonOut;	
	});

	it("should trigger a hover delay after 0.05 seconds", function(done){
		var $el = basicButtonElement();
		$el.hoverDelay({delayOver: 50, over: function() {
			window._globalButtonHover = true;}});
		
		$el.trigger("mouseover");

		assert.isUndefined(window._globalButtonHover);

		window.setTimeout(function () {
			assert.isTrue(window._globalButtonHover);
			done(); 
		}, 50);	
	});
	it("should have a mouseout delay of 0.05 seconds", function(done) {
	 	var $el = basicButtonElement();
	 	$el.hoverDelay({
	 		out: function() { window._globalButtonHover = true; },
	 		delayOut: 50});
	 	
	 	$el.trigger("mouseout");

	 	assert.isUndefined(window._globalButtonHover);
	 	window.setTimeout(function() {
	 		assert.isTrue(window._globalButtonHover);
	 		done();} ,
	 		50);
	 });

	it("should have a mouseout and a hover delay of 0.05 seconds each", function(done) {
		var $el = basicButtonElement();
		$el.hoverDelay({
			over: function() { window._globalButtonHover = true; },
			out: function() { window._globalButtonOut = true; },
			delayOver: 50,
			delayOut: 50
		});

		$el.trigger("mouseover");
		$el.trigger("mouseout");

		assert.isUndefined(window._globalButtonOut);
		assert.isUndefined(window._globalButtonHover);
		window.setTimeout(function() {
			assert.isTrue(window._globalButtonHover);
			assert.isTrue(window._globalButtonOut);
			done();},
			50);
	});	

	it("should not trigger the hover delay when a mouseout delay is set", function(done) {
		var $el = basicButtonElement();
		$el.hoverDelay({delayOut: 50, out: function() {
			window._globalButtonHover = true;}});
		
		$el.trigger("mouseover");

		window.setTimeout(function () {
			assert.isUndefined(window._globalButtonHover);
			done();},
			50);
	});

	it("should not trigger the mouseout delay when a hover delay is set", function(done) {
		var $el = basicButtonElement();
		$el.hoverDelay({delayOver: 50, over: function() {
			window._globalButtonHover = true;}});
		
		$el.trigger("mouseout");
		
		window.setTimeout(function () {
			assert.isUndefined(window._globalButtonHover);
			done();},
			50);
	});
	
});