var chai = {};

chai.assert = 
{
    equal: function(actual, expected, message)
    {
        if (actual != expected)
        {
            throw new Error(message || "expected " + actual + " to equal " + expected);
        }
    },

    isString: function(actual, message)
    {
        if (typeof(actual) != "string")
        {
            throw new Error(message || "expected " + actual + " to be a string");
        }
    },

    isUndefined: function(actual, message)
    {
        if (typeof(actual) != "undefined")
        {
            throw new Error(message || "expected " + actual + " to be undefined");
        }
    },

    isTrue: function(actual, message)
    {
        if (actual !== true)
        {
            throw new Error(message || "expected " + actual + " to be true");
        }
    },

    isFalse: function(actual, message)
    {
        if (actual !== false)
        {
            throw new Error(message || "expected " + actual + " to be false");
        }
    },

    ok: function(actual, message)
    {
        if (!actual)
        {
            throw new Error(message || "expected " + actual + " to be truthy");
        }
    },

    notOk: function(actual, message)
    {
        if (actual)
        {
            throw new Error(message || "expected " + actual + " to be falsey");
        }
    }
};