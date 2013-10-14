describe("jquery.cookies", function()
{
    var assert = chai.assert;
    var _lastCookie;

    $.cookies.setDefaults({ path: "/", permanentDate: "Sun, 13 Oct 2100 19:53:24 GMT", watcher: function(data) { _lastCookie = data; } });

    function deleteAllCookies() 
    {
        var cookies = document.cookie.split(";");

        for (var i = 0; i < cookies.length; i++) 
        {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
    }

    beforeEach(deleteAllCookies);
    afterEach(deleteAllCookies);

    describe("jquery.cookies.set", function()
    {
        it("should set a session cookie with no other arguments", function()
        {
            $.cookies.set("cookie1", "foo1");

            assert.equal(document.cookie, "cookie1=foo1");
        });

        it("should set a session cookie using a settings argument", function()
        {
            $.cookies.set({ name: "cookie2", value: "foo2" });

            assert.equal(document.cookie, "cookie2=foo2");
        });

        it("should set a permanent cookie using a settings argument", function()
        {
            $.cookies.set({ name: "cookie3", value: "foo3", permanent: true });

            assert.equal(document.cookie, "cookie3=foo3");
            assert.equal(_lastCookie, "cookie3=foo3; path=/; expires=Sun, 13 Oct 2100 19:53:24 GMT");
        });

        it("should set a session cookie with sub values using a settings argument", function()
        {
            $.cookies.set({ name: "cookie4", value: { "sub1": "value1", "sub2": "value2" } });

            assert.equal(document.cookie, "cookie4=sub1=value1&sub2=value2");
        });

        it("should set a session cookie with sub values", function()
        {
            $.cookies.set("cookie4", { "sub1": "value1", "sub2": "value2" });

            assert.equal(document.cookie, "cookie4=sub1=value1&sub2=value2");
        });

        it("should merge subvalues into existing cookies by default", function()
        {
            $.cookies.set({ name: "cookie5", value: { "sub1": "value1", "sub2": "value2" } });
            $.cookies.set({ name: "cookie5", value: { "sub2": "value2a", "sub3": "value3" } });

            assert.equal(document.cookie, "cookie5=sub1=value1&sub2=value2a&sub3=value3");
        });

        it("should overwrite subvalues into existing cookies when clearExisting is true", function()
        {
            $.cookies.set({ name: "cookie6", value: { "sub1": "value1", "sub2": "value2" } });
            $.cookies.set({ name: "cookie6", value: { "sub2": "value2a", "sub3": "value3" }, clearExisting: true });

            assert.equal(document.cookie, "cookie6=sub2=value2a&sub3=value3");
        });

        it("should URL encode subvalues", function()
        {
            $.cookies.set({ name: "cookie7", value: { "sub1": "this=that", "sub2": "1;2" } });

            assert.equal(document.cookie, "cookie7=sub1=this%3Dthat&sub2=1%3B2");
        });

        it("should URL encode top-level-values", function()
        {
            $.cookies.set({ name: "cookie8", value: "this=that" });

            assert.equal(document.cookie, "cookie8=this%3Dthat");
        });
    });

    describe("jquery.cookies.get", function()
    {
        it("should read an existing top-level cookie as a string", function()
        {
            document.cookie = "cookie7=foo; path=/;";

            var value = $.cookies.get("cookie7");

            assert.equal(value, "foo");
        });

        it("should read an encoded existing top-level cookie as a string", function()
        {
            document.cookie = "cookie7=this%3Dthat; path=/;";

            var value = $.cookies.get("cookie7");

            assert.equal(value, "this=that");
        });

        it("should read an existing cookie with sub values as an object", function()
        {
            document.cookie = "cookie6=sub1=value1&sub2=value2; path=/;";

            var value = $.cookies.get("cookie6");

            assert.isObject(value);
            assert.equal(value.sub1, "value1");
            assert.equal(value.sub2, "value2");
        });

        it("should read an encoded existing cookie with sub values as an object", function()
        {
            document.cookie = "cookie6=sub1=this%3Dthat&sub2=1%3B2; path=/;";

            var value = $.cookies.get("cookie6");

            assert.isObject(value);
            assert.equal(value.sub1, "this=that");
            assert.equal(value.sub2, "1;2");
        });

        it("should read a non-existent top-level cookie as null", function()
        {
            var value = $.cookies.get("cookie7");

            assert.isNull(value);
        });

        it("should not read a subvalue as a top level cookie", function()
        {
            $.cookies.set({ name: "cookie7", value: { "sub1": "value1", "sub2": "value2" } });

            var value = $.cookies.get("sub1");
            assert.isNull(value);
        });
    });

    describe("jquery.cookies.remove", function()
    {
        it("should delete a top level cookie", function()
        {
            document.cookie = "cookie6=hello%20world; path=/;";

            $.cookies.remove("cookie6");

            assert.equal(document.cookie, "");
        });
    });

});