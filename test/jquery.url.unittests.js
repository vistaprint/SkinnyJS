describe("jquery.url", function()
{
    var assert = chai.assert;

    describe("#ctor()", function()
    {
        it("should parse a URL with all parts specified", function()
        {
            var URL = "http://www.vistaprint.com:80/vp/mypath/mypage.htm?val1=1&val2=2#myhash";

            var url = new $.Url(URL);

            assert.strictEqual(url.protocol(), "http:");
            assert.strictEqual(url.host(), "www.vistaprint.com:80");
            assert.strictEqual(url.hostname(), "www.vistaprint.com");
            assert.strictEqual(url.port(), "80");
            assert.strictEqual(url.pathname(), "/vp/mypath/mypage.htm");
            assert.strictEqual(url.search(), "?val1=1&val2=2");
            assert.strictEqual(url.hash(), "#myhash");
            assert.strictEqual(url.getItem("val1"), "1");
            assert.deepEqual(url.queryString, { val1: "1", val2: "2" });

            assert.strictEqual(url.toString(), URL);
        });

        it("should parse a virtual path", function()
        {
            var URL = "/vp/mypath/mypage.htm?val1=1&val2=2#myhash";

            var url = new $.Url(URL);

            assert.strictEqual(url.pathname(), "/vp/mypath/mypage.htm");
            assert.strictEqual(url.search(), "?val1=1&val2=2");
            assert.strictEqual(url.hash(), "#myhash");
            assert.strictEqual(url.getItem("val1"), "1");
            assert.deepEqual(url.queryString, { val1: "1", val2: "2" });

            assert.strictEqual(url.toString(), URL);
        });

        it("should parse a host only", function()
        {
            var URL = "http://www.vistaprint.com";

            var url = new $.Url(URL);

            assert.strictEqual(url.host(), "www.vistaprint.com");

            assert.strictEqual(url.toString(), URL);
        });

        it("should parse a host with port", function()
        {
            var URL = "http://www.vistaprint.com:8020";

            var url = new $.Url(URL);

            assert.strictEqual(url.host(), "www.vistaprint.com:8020");
            assert.strictEqual(url.pathname(), "");

            assert.strictEqual(url.toString(), URL);
        });

        it("should parse a host with port and trailing slash", function()
        {
            var URL = "http://www.vistaprint.com:8020/";

            var url = new $.Url(URL);

            assert.strictEqual(url.host(), "www.vistaprint.com:8020");
            assert.strictEqual(url.pathname(), "/");

            assert.strictEqual(url.toString(), URL);
        });

        it("should parse a simple string as a pathname", function()
        {
            var URL = "foo";

            var url = new $.Url(URL);

            assert.strictEqual(url.host(), "");
            assert.strictEqual(url.pathname(), "foo");

            assert.strictEqual(url.toString(), URL);
        });

        it("should parse a url with a question mark only", function()
        {
            var URL = "foo?";

            var url = new $.Url(URL);

            assert.strictEqual(url.host(), "");
            assert.strictEqual(url.pathname(), "foo");
            assert.strictEqual(url.search(), "");

            assert.strictEqual(url.toString(), "foo");
        });

        it("should parse a url with a querystring", function()
        {
            var URL = "foo?bar=baz";

            var url = new $.Url(URL);

            assert.strictEqual(url.host(), "");
            assert.strictEqual(url.pathname(), "foo");
            assert.strictEqual(url.search(), "?bar=baz");

            assert.strictEqual(url.toString(), "foo?bar=baz");
        });

        it("should parse a url with a hash", function()
        {
            var URL = "foo#somehash";

            var url = new $.Url(URL);

            assert.strictEqual(url.host(), "");
            assert.strictEqual(url.pathname(), "foo");
            assert.strictEqual(url.search(), "");
            assert.strictEqual(url.hash(), "#somehash");

            assert.strictEqual(url.toString(), "foo#somehash");
        });

        it("should support no arguments", function()
        {
            var url = new $.Url();
            url.host("www.vistaprint.com");

            assert.strictEqual(url.toString(), "http://www.vistaprint.com");
        });
    });

    describe("#protocol()", function()
    {
        it("should act as a setter with an argument", function()
        {
            var URL = "http://www.vistaprint.com";

            var url = new $.Url(URL);
            url.protocol("https:");

            assert.strictEqual(url.protocol(), "https:");

            assert.strictEqual(url.toString(), "https://www.vistaprint.com");
        });
    });

    describe("#hostname()", function()
    {
        it("should act as a setter with an argument", function()
        {
            var URL = "http://www.vistaprint.com";

            var url = new $.Url(URL);
            url.hostname("www.vp.com");

            assert.strictEqual(url.hostname(), "www.vp.com");

            assert.strictEqual(url.toString(), "http://www.vp.com");
        });
    });

    describe("#port()", function()
    {
        it("should act as a setter with an argument", function()
        {
            var URL = "http://www.vistaprint.com";

            var url = new $.Url(URL);
            url.port("8080");

            assert.strictEqual(url.host(), "www.vistaprint.com:8080");
            assert.strictEqual(url.port(), "8080");

            assert.strictEqual(url.toString(), "http://www.vistaprint.com:8080");
        });
    });

    describe("#host()", function()
    {
        it("should act as a setter with an argument", function()
        {
            var URL = "http://www.vistaprint.com";

            var url = new $.Url(URL);
            url.host("www.vp.com");

            assert.strictEqual(url.hostname(), "www.vp.com");
            assert.strictEqual(url.host(), "www.vp.com");

            assert.strictEqual(url.toString(), "http://www.vp.com");
        });

        it("should act as a setter with an argument and port", function()
        {
            var URL = "http://www.vistaprint.com";

            var url = new $.Url(URL);
            url.host("www.vp.com:8080");

            assert.strictEqual(url.hostname(), "www.vp.com");
            assert.strictEqual(url.host(), "www.vp.com:8080");
            assert.strictEqual(url.port(), "8080");

            assert.strictEqual(url.toString(), "http://www.vp.com:8080");
        });
    });

    describe("#pathname()", function()
    {
        it("should act as a setter with an argument", function()
        {
            var URL = "http://www.vistaprint.com";

            var url = new $.Url(URL);
            url.pathname("/foo/bar/");

            assert.strictEqual(url.pathname(), "/foo/bar/");

            assert.strictEqual(url.toString(), "http://www.vistaprint.com/foo/bar/");
        });
    });

    describe("#search()", function()
    {
        it("should act as a setter with an argument", function()
        {
            var URL = "http://www.vistaprint.com";

            var url = new $.Url(URL);
            url.search("?arg1=foo&arg2=bar");

            assert.strictEqual(url.search(), "?arg1=foo&arg2=bar");
            assert.deepEqual(url.queryString, { arg1: "foo", arg2: "bar" });

            assert.strictEqual(url.toString(), "http://www.vistaprint.com?arg1=foo&arg2=bar");
        });

        it("should act as a setter with an argument passing null", function()
        {
            var URL = "http://www.vistaprint.com?foo=bar";

            var url = new $.Url(URL);
            url.search(null);

            assert.strictEqual(url.search(), "");
            assert.deepEqual(url.queryString, {});

            assert.strictEqual(url.toString(), "http://www.vistaprint.com");
        });

        it("should act as a setter with an argument passing a string without a ?", function()
        {
            var URL = "http://www.vistaprint.com?foo=bar";

            var url = new $.Url(URL);
            url.search("foo=bar");

            assert.strictEqual(url.search(), "?foo=bar");
            assert.deepEqual(url.queryString, { foo: "bar" });

            assert.strictEqual(url.toString(), "http://www.vistaprint.com?foo=bar");
        });

        it("should act as a setter with an argument passing a string without a ?, key only", function()
        {
            var URL = "http://www.vistaprint.com?foo=bar";

            var url = new $.Url(URL);
            url.search("foo");

            assert.strictEqual(url.search(), "?foo=");
            assert.deepEqual(url.queryString, { foo: "" });

            assert.strictEqual(url.toString(), "http://www.vistaprint.com?foo=");
        });
    });

});