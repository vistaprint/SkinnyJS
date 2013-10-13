/* global ns1 */

describe("jQuery.ns()", function()
{
    mocha.globals([ "ns1" ]);

    var assert = chai.assert;

    it("should be able to declare a single namespace", function()
    {
        $.ns("ns1");

        assert.typeOf(ns1, "object", "Ensure ns1 is an object");
    });

    it("should preserve an existing global namespace", function()
    {
        window.ns1 = {
            property1: "value1"
        };

        $.ns("ns1");

        assert.typeOf(ns1, "object", "Ensure ns1 is an object");
        assert.equal(ns1.property1, "value1", "Ensure ns1.property1's value is correct");
    });

    it("should preserve an existing secondary namespace", function()
    {
        window.ns1 = {
            property1: "value1",
            ns2: {
                property2: "value2"
            }
        };

        $.ns("ns1.ns2");

        assert.typeOf(ns1, "object", "Ensure ns1 is an object");
        assert.equal(ns1.property1, "value1", "Ensure ns1.property1's value is correct");

        assert.typeOf(ns1.ns2, "object", "Ensure ns2 is an object");
        assert.equal(ns1.ns2.property2, "value2", "Ensure ns1.ns2.property2's value is correct");
    });

    it("should preserve previous namespaces when declaring a tertiary namespace", function()
    {
        window.ns1 = {
            property1: "value1",
            ns2: {
                property2: "value2"
            }
        };

        $.ns("ns1.ns2.ns3");

        assert.typeOf(ns1, "object", "Ensure ns1 is an object");
        assert.equal(ns1.property1, "value1", "Ensure ns1.property1's value is correct");

        assert.typeOf(ns1.ns2, "object", "Ensure ns2 is an object");
        assert.equal(ns1.ns2.property2, "value2", "Ensure ns1.ns2.property2's value is correct");

        assert.typeOf(ns1.ns2.ns3, "object", "Ensure ns1.ns2.ns3 is an object");
    });
});