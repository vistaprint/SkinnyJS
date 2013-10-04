$(document).ready(function ()
{
    module('jquery.observeChildren');

    QUnit.asyncTest('Ensure observeChildren finds to existing elements by tag', 1, function ()
    {
        $('ul', 'body').remove();
        var ul = $('<ul>').appendTo('body');

        function callback (element)
        {
            $('body').disconnectChildObservers();
            equal(ul[0], element, 'Element matches');
            start();
        }

        $('body').observeChildren(callback, 'ul');
    });

    QUnit.asyncTest('Test mutation observer', 1, function ()
    {
        function callback (element)
        {
            $('body').disconnectChildObservers();
            equal(element.tagName, 'SELECT', 'Mutation element found');
            if (element.tagName == 'SELECT')
            {
                $(element).remove();
            }
            start();
        }

        $('body').observeChildren(callback).append($('<select>'));
    });

    QUnit.asyncTest('Second mutation observer test', 2, function ()
    {
        var count = 0;

        function callback (element)
        {
            count++;
            
            equal(element.tagName, 'SELECT', 'Mutation element found: ' + count + 'nth');
 
            if (element.tagName == 'SELECT')
            {
                element.parentNode.removeChild(element);
            }

            if (count == 2)
            {
                $('body').disconnectChildObservers();
                start();
            }
        }

        $('body')
            .observeChildren(callback)
            .append($('<select>'))
            .append($('<select>'));
    });
});
