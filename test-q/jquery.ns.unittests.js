/* global ns1 */

$(document).ready(function()
{
    module("jquery.ns");

    test("Ensure single namespace declared", function()
    {
        $.ns("ns1");

        ok(typeof(ns1) == "object", "Ensure ns1 is an object");
    });

    test("Ensure existing namespace preserved", function()
    {
        window.ns1 = {
            property1: "value1"
        };

        $.ns("ns1");

        ok(typeof(ns1) == "object", "Ensure ns1 is an object");
        equal(ns1.property1, "value1", "Ensure ns1.property1's value is correct");
    });

    test("Ensure existing secondary namespace preserved", function()
    {
        window.ns1 = {
            property1: "value1",
            ns2: {
                property2: "value2"
            }
        };

        $.ns("ns1.ns2");

        ok(typeof(ns1) == "object", "Ensure ns1 is an object");
        equal(ns1.property1, "value1", "Ensure ns1.property1's value is correct");

        ok(typeof(ns1.ns2) == "object", "Ensure ns2 is an object");
        equal(ns1.ns2.property2, "value2", "Ensure ns1.ns2.property2's value is correct");
    });

    test("Ensure declaring teriary namespace, previous namespaces preserved", function()
    {
        window.ns1 = {
            property1: "value1",
            ns2: {
                property2: "value2"
            }
        };

        $.ns("ns1.ns2.ns3");

        ok(typeof(ns1) == "object", "Ensure ns1 is an object");
        equal(ns1.property1, "value1", "Ensure ns1.property1's value is correct");

        ok(typeof(ns1.ns2) == "object", "Ensure ns2 is an object");
        equal(ns1.ns2.property2, "value2", "Ensure ns1.ns2.property2's value is correct");

        ok(typeof(ns1.ns2.ns3) == "object", "Ensure ns1.ns2.ns3 is an object");
    });
});