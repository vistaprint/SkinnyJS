describe("jquery.elemQuery", function()
{
    var assert = chai.assert;

    it("should initialize a class immediately", function()
    {
        var $el = $("<div />").appendTo("body").css({ width: "300px" });

        $el.elemQuery(200, 400, 600);

        assert.equal($el.attr("class"), "content-200to400");
    });

    it("should update on resize", function()
    {
        var $el = $("<div />").appendTo("body").css({ width: "300px" });

        $el.elemQuery(200, 400, 600);

        $el.css({ width: "500px "});

        $(document).trigger("resize");

        assert.equal($el.attr("class"), "content-400to600");
    });

    it("should set class over specified maximum", function()
    {
        var $el = $("<div />").appendTo("body").css({ width: "200px" });

        $el.elemQuery(200, 400, 600);

        assert.equal($el.attr("class"), "content-200to400");
    });

    it("should set class under specified minimum", function()
    {
        var $el = $("<div />").appendTo("body").css({ width: "199px" });

        $el.elemQuery(200, 400, 600);

        assert.equal($el.attr("class"), "content-0to200");
    });

    it("should set class to maximum", function()
    {
        var $el = $("<div />").appendTo("body").css({ width: "600px" });

        $el.elemQuery(200, 400, 600);

        assert.equal($el.attr("class"), "content-600plus");
    });
});