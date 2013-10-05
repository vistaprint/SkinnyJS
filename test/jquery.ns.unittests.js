/* global ns1 */

describe("jQuery.ns", function()
{
    var assert = chai.assert;

    it("Ensure single namespace declared", function()
    {
        $.ns("ns1");

        assert.typeOf(ns1, "object", "Ensure ns1 is an object");
    });

    it("Ensure existing namespace preserved", function()
    {
        window.ns1 = {
            property1: "value1"
        };

        $.ns("ns1");

        assert.typeOf(ns1, "object", "Ensure ns1 is an object");
        assert.equal(ns1.property1, "value1", "Ensure ns1.property1's value is correct");
    });

    it("Ensure existing secondary namespace preserved", function()
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

    it("Ensure declaring teriary namespace, previous namespaces preserved", function()
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