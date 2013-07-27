# Modal dialogs

## Source
You can view the [full annotated source](js/jquery.modalDialog.html)

## Features

For a dialog's content, the framework can use one of the following techniques:

* Use an element on the page ("node dialog")
* Display a different page within the dialog ("IFrame dialog")
* Load content via AJAX ("ajax dialog")

Other features:

* The API for IFrame dialogs works seamlessly across different domains (i.e. www.vistaprint.com vs secure.vistaprint.com) by internally using window.postMessage()
* A dialog's height is based on the content size. There is no explicit method to specify the height.
* The dialog framework supports mobile devices via responsive design.

## Usage

### Adding jQuery.modalDialog to your site:

TODO: Look at JQueryModalDialog and copy the HTML

### Creating a dialog

To create a dialog, use the following method:

    $.modalDialog.create()

#### Settings

`$.modalDialog.create()` takes a settings object as an argument. Here are the available settings:

* **title**: The title to display in the title bar of the dialog.
* **id**: The internal ID of the dialog. If the same ID is passed to <code>$.modalDialog.create()</code> more than once, the existing dialog is reused.
* **maxWidth**: Sets the maximum width of the dialog. Note that on small mobile devices, the actual width may be smaller, so you should design the dialog content accordingly. Defaults to 600.
* **skin**:  The name of the skin to use for the dialog. Defaults to "primary".
* **ajax**:  Determines how the ''url'' setting is interpreted. If true, the URL is the source for an AJAX dialog. If false, it will be the URL of an IFrame dialog.
* **url**:  The URL for the content of an IFrame or AJAX dialog.
* **content**:  A CSS selector or jQuery object for a content node to use for a node dialog.
* **destroyOnClose**:  If true, the dialog DOM will be destroyed and all events removed when the dialog closes. Defaults to ''false''.
* **containerElement**:  A CSS selector or jQuery object for the element that should be the parent for the dialog DOM (useful for working with jQuery mobile). Defaults to "body".
* **preventEventBubbling**:  If true, click and touch events are prevented from bubbling up to the document. Defaults to ''true''.
* **onbeforeopen**: A handler for the ''beforeopen'' event. See [[#Events| events]] below.
* **onopen**: A handler for the ''open'' event. See [[#Events| events]] below.
* **onclose**: A handler for the ''close'' event. See [[#Events| events]] below.
* **onbeforeclose**: A handler for the ''beforeclose'' event. See [[#Events| events]] below.
* **onajaxerror**:  A handler for the ''ajaxerror'' event. See [[#Events| events]] below.

### Dialog object methods

`$.modalDialog.create()` returns a dialog object with the following methods:

* **open()**: Opens the dialog
* **close()**: Closes the dialog
* **center()**: Centers the dialog based on the current dimensions
* **setTitle()**: Sets the title displayed in the dialog's title bar
* **getWindow()**: Gets a reference to the window for the dialog. For an IFrame dialog, this is the content window, for node or AJAX dialogs, it is the host window. This is useful for sending messages between dialogs.
* **getParent()**: Gets a reference to the dialog object immediately below the current dialog in visual stacking order (usually the one that opened it). This will be null for a dialog that was opened directly from the host window, and has no parent dialog.

### Node dialogs

A node dialog is created using an element on the page. To open a node dialog, use the following syntax:

    var dialog = $.modalDialog.create({ content: ".color-dialog", title: JSLM_ColorDialogTitle });
    dialog.open();
     
    //close dialog
    dialog.close();

There is also an alternative jQuery-centric syntax. This is completely equivalent to the previous snippet:

    // Opens the dialog immediately
    $(".color-dialog").modalDialog({ title: JSLM_ColorDialogTitle });
    
    // Closes the dialog
    $(".color-dialog").modalDialog("close");

### AJAX dialogs

An AJAX dialog is created using content which is dynamically loaded from a URL. To create an AJAX dialog, use the following syntax:

    var dialog = $.modalDialog.create({ url: "/warning.aspx", ajax: true });
    dialog.open();
     
    //close dialog
    dialog.close();

#### Defining the content for an AJAX dialog

##### Layout pages for AJAX dialog content

TODO: remove VPisms
AJAX dialogs' content should have no layout page; just render the content to display. In Razor, you would use this:

    @{ this.Layout = null; }

##### JavaScripts in AJAX dialog content
Any scripts included in the content will get loaded dynamically, after the DOM elements have been loaded. Scripts that are already loaded in the window will be ignored (not run a second time), but script snippets will be executed.

### IFrame dialogs

IFrame dialogs contain an embedded IFrame that shows a self-contained webpage. These are particularly useful for a few reasons:

* They can encapsulate the dialog's content completely.
* HTML, scripts, and CSS are completely isolated from the parent window.
* They can load content cross-domain.

To create an IFrame dialog, use the following syntax:

    var dialog = $.modalDialog.create({ url: "/studio/color-dialog.aspx" });
    dialog.open();
     
    //close dialog
    dialog.close();

In an IFrame dialog, the height of the dialog is determined by the content.

#### Defining the content of an IFrame dialog
##### Layout page

TODO remove VPisms
IFrame dialogs should use the Razor layout page:
    
    this.Layout = "~/Sales/Mobile/Mvc/Views/Shared/_DialogMobileLayout.cshtml";

##### Notifying the parent window when the IFrame is rendered and ready to show
The dialog framework waits to show an IFrame dialog until it's content window notifies it that it is fully rendered. By default, this happens on window.onload.

In certain cases, a dialog may require extra initialization (i.e. it may use JavaScript to render some content), and is not necessarily ready on window.onload. To handle this, you would want to disable manual notification to the framework that the dialog is ready by setting the following property:

    $.modalDialog.manualNotifyReady = true;

Then, when your dialog's content is fully rendered, call:

    $.modalDialog.getCurrent().notifyReady();

##### Dialog size
The size of the dialog is determined automatically based on the size of the content in the IFrame. Because it can be tricky to determine the height of content in HTML, there are a few configuration options to help the framework determine the size:

* **$.modalDialog.autoSizing**: If enabled, the dialog framework looks for changes to content size and adjust the dialog size automatically. True by default.
* **$.modalDialog.sizeElement**: A CSS selector for an element that the framework should measure to get the size of the content. By default, it looks for an element matching the selector .dialog-content-size.

If $.modalDialog.autoSizing' is set false, then you will want to resize the dialog manually using one of the following methods:

    // Set height explicitly
    $.modalDialog.getCurrent().setHeight(400);
    
    // Set height based on content
    $.modalDialog.getCurrent().setHeightFromContent();

##### Dialog title
The title displayed in the dialog is driven by the HTML title tag of the document in the IFrame. You can override this by specifically calling:

    $.modalDialog.getCurrent().setTitle("New title");

##### Cross-domain support
If your IFrame content is in a different domain than the parent window, you need to tell the content window how to reach the parent window:

    $.modalDialog.parentHostName = "http://www.vistaprint.com";

### Creating multiple active dialogs

Dialogs can be opened in succession (i.e. a dialog can open another dialog). This even works from an IFrame dialog, and even across domains.

To open a dialog from another dialog (including an IFrame dialog), simply use `$.modalDialog.create()`.

**Warning**: There is one important exception: An IFrame dialog cannot open a node dialog. This is because the IFrame is, by definition, in a different window than the host window, and cannot share its DOM with the parent window. You can, however, open an AJAX dialog, or another IFrame dialog from an IFrame dialog.

### Events

Dialogs support a number of lifecycle events:

* **beforeopen**: Fires before the dialog opens. Calling event.preventDefault() on the event object will cancel the opening of the dialog.
* **open**: Fires after the dialog has opened, and has animated into place.
* **beforeclose**: Fires before the dialog closes. Calling event.preventDefault() on the event object will cancel the closing of the dialog. The property event.isDialogCloseButton indicates that the top dialog close button was clicked.
* **close**: Fires after the dialog closes. The property event.isDialogCloseButton indicates that the top dialog close button was clicked.
* **ajaxerror**: Fires if an error occurs loading an AJAX dialog.

#### Handling events
There are two ways to assign event handlers, as options to `$.modalDialog.create()`, or by adding event handlers to the dialog object returned by `$.modalDialog.create()`.

Here is an example of using the beforeopen event:

    $.modalDialog.create({ 
        url: "/foo.aspx", 
        onbeforeopen: function(e) 
        { 
            if (!confirm("Are you sure you want to open this dialog?")) 
            {
                e.preventDefault(); 
            }
        });

This example is completely equivalent:

    var dialog = $.modalDialog.create({ url: "/foo.aspx" });
    dialog.onbeforeopen.add(function(e) 
    { 
        if (!confirm("Are you sure you want to open this dialog?")) 
        { 
            e.preventDefault(); 
        }
    });

**Tip**: These events are even supported in cross-domain IFrame dialogs!

### Unobtrusive usage

The dialog framework also supports an unobtrusive, declarative syntax:
Open an iFrame dialog:

    <a href="/content.aspx" data-rel="modalDialog">Open content</a>

Open a node dialog:

    <a href="#content" data-rel="modalDialog">Open content</a>
    
    <!-- Note the 'dialog-content' class. This ensures the content is invisible before the dialog is shown -->
    <div id="content" class="dialog-content">Here's some content</div>

Any options supported in the $.modalDialog.create() method are supported declaratively, with the prefix data-dialog-:

    <a href="#content" data-rel="modalDialog" data-dialog-onclose="updateContent(e);">Show color picker</a>

#### Unobtrusive dialog events

If you want to assign handlers unobtrusively, you can access the dialog when it is created with the dialogcreate event:

    <a href="#colorPicker" data-rel="modalDialog" id="colorPickerLink">Show color picker</a>

Then, in script, you can access the dialog:

    $("#colorPickerLink").on("dialogcreate", function(e)
    {
        e.dialog.onopen.add(function() { alert("opened"); });
    });

### Defining buttons in a dialog

TODO: figure out how this should work outside VP

    <div class="dialog-button-group">
        <a href="#" class="dialog-button primary">OK</a>
        <a href="#" class="dialog-button">Cancel</a>
    </div>