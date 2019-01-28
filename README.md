# Web To OpenFin Walkthrough

In this exercise we'll walk through extending a basic web application to the OpenFin Runtime.

Required for this exercise: [Node](https://nodejs.org/en/download/)

## Launching a Website on OpenFin

Globally install the OpenFin command line interface from your terminal.

```bash
npm install --global openfin-cli
```

We can now use the CLI tool to launch a website in the OpenFin Runtime.

```bash
openfin --launch --url https://www.apple.com
```

We use two flags: `--launch` and `--url`. The launch flag tells the CLI to open the target, while the URL points to the remote application we want to launch. For more usage examples check out the package on [NPM](https://www.npmjs.com/package/openfin-cli).

## Local Development

We've provided a local site to host in our `public` directory. It's a simple Hello World example that contains a home page and a second "data" page that has some static tables.:

Feel free to launch the public directory with whatever local webserver your want. Since we've already used Node.js, this repository contains the code necessary to run the site locally using node thanks to [live-server](https://www.npmjs.com/package/live-server).

To launch the site locally:
```bash
npm install
npm run start
```

You can visit [localhost:5000](http://localhost:5000) where you should see `Hello World`.

We can launch our site using our command line tool by targeting our locally hosted site.

```bash
openfin --launch --url http://localhost:5000
```

### fin.desktop

For now we will manually access the console by right clicking in our window and selecting "Inspect Element". The (possibly familiar) Chrome Dev Tools should appear. From the javascript console tab enter `fin.desktop` and push return.

Expanding the returned object shows us a high level breakdown of the OpenFin API. This global is pre-loaded into the OpenFin Runtime. Now let's start expanding our Hello World example using its features.

## Application Window

### Size

Let's find an appropriate size for our main window.

```javascript
// Create a variable representing the main application window
var mainWindow = fin.desktop.Window.getCurrent();

// Let's make our window nice and big relative to the default top left of the window
mainWindow.resizeBy(300, 100);

// Too wide. Let's make it smaller, but relative to the bottom right corner of the window.
mainWindow.resizeBy(-350, -100, 'bottom-right');

// Make a specific size with resizeTo
mainWindow.resizeTo(300, 200);
```
*API Docs:* [.Window.resizeBy](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_Window.html#resizeBy), [.Window.resizeTo](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_Window.html#resizeTo)

### Position

Since our application is no longer confined to a browser window, we'll use the OpenFin API to move it to our preferred position on the screen. The process looks very similar to resizing and is once again made easy by the OpenFin API.

```javascript
// relative movement
mainWindow.moveBy(100,100);

// absolute movement
mainWindow.moveTo(10,10);
```
*API Docs:* [.Window.moveBy](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_Window.html#moveBy), [.Window.moveTo](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_Window.html#moveTo)

### Frame

Let's customize our main window's appearance using the OpenFin API. It currently sits in a frame provided by our operating system. 

```javascript
// Call update on the window & send it the paramters we want in a JSON 
mainWindow.updateOptions({ frame: false });
```
*API Docs:* [.Window.getCurrent](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_Window.html#.getCurrent), [.Window.updateOptions](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_Window.html#updateOptions)

Executing the above in our console the frame disappears but our window is now stuck in place. Rather than relying on OS level features to give our app room to run, we can use modern web development practices. In this case it's as easy as changing our `headline` element's style.

```javascript
// Retrieve the element to apply the CSS to
var headlineElement = document.getElementsByClassName('headline')[0];
headlineElement.style.webkitAppRegion = 'drag';
```

In this latest example we didn't even need the OpenFin API - just some modern CSS. Since OpenFin is built on top of Chromium we don't have to worry about supporting older browsers however.

### Launch Configuartion

Now that we know how we want our application to look each time it's launched on OpenFin let's update our site.

First, we'll add the CSS to make our window movable to our headline class. This only requires one line.
```css
// In public/css/app.css
.headline {
  -webkit-app-region: drag;
```

As for our window options & size, these parameters can be passed in to the Application Manifest. This file serves as a configurable entry point for your OpenFin applications.

When launching a site from a URL, OpenFin checks for the existence of an application manifest. If one is not present, a default is created locally. Since we targeted `localhost:5000` earlier, we have an auto-generated `app.json` file with default parameters in our current working directory.

This repository includes a slightly updated version called `configuredapp.json` we can target going forward. Our changes are placed in the `"startup_app"` & configure our app to launch as a small, frameless window in the upper left corner of the screen.

From this same document we can specify a runtime version & desktop shortcut information for our app.

```javascript
{
    "devtools_port": 9090,
    "startup_app": {
        "name": "HelloWorld",
        "description": "Hello World Example",
        "url": "http://localhost:5000",
        "uuid": "HelloWorld-9ezuafh3nay4t4cqb3issjor",
        "autoShow": true,
        "frame": false,
        "defaultHeight": 200,
        "defaultWidth": 300,
        "defaultTop": 10,
        "deafultLeft": 10,
        "saveWindowState": false,
        "cornerRounding": {
            "width": 10,
            "height": 10
        }
    },
    "runtime": {
        "arguments": "",
        "version": "6.49.20.3"
    },
    "shortcut": {
        "company": "MyCompany",
        "description": "Openfining our Webapp",
        "name": "HelloWorld"
    }
}
```

[Application Manifest](https://openfin.co/application-config/)

Now to launch our application we can target `configuredapp.json` instead of our URL.

```bash
openfin --launch --config configuredapp.json
```

## Child Windows & Notifications

Applications running on OpenFin are not limited to the typical user experience paradigms. Let's take a look at features in particular that open more of the "desktop DOM" to the user.

### Child Windows

In our sample application, our 2nd page is tasked with displaying data to our users. Rather than forcing them to choose between two pages of our application, let's open our data page in a separate window.

To do so, we'll create one using the OpenFin Window constructor. The window requires a name and URL parameter. Since we're launching our own page, we can use a relative one.

```javascript
// This code is excuted when we press the My Data button on our homepage.
var dataWindow = new fin.desktop.Window({
    name: "dataWindow",
    url: "datapage.html",
    defaultLeft: 10,
    defaultTop: 220,
    autoShow: true
});

// We can also hide it
dataWindow.hide();
```
API Docs: [Window Constructor](http://cdn.openfin.co/jsdocs/stable/tutorial-window.constructor.html), [.Window.show](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_Window.html#show), [.Window.hide](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_Window.html#hide)

### Notifications

Windows are persisted on the screen. We need a way to pass information onto our users that they can then interact with. Enter notifications.

An OpenFin notification is like a window in that it requires a URL to launch & displays on the screen when told to do so. Behaviorlly they differ however. Notications are displayed briefly in the bottom right corner of the user's screen and only for a limited time.

We will use the provided `sampleNotification.html` document to launch our first Notification from our javascript console.

```javascript
new fin.desktop.Notification({ url: "sampleNotification.html" });
```

The document is displayed as a static asset. We can pass a message to our notification on creation for some customization.

```javascript
new fin.desktop.Notification({ 
  url: "sampleNotification.html",
  message: new Date().toLocaleString() });
```

If we take a look at [sampleNotification.html](public/sampleNotification.html) we see there is a script tag with an `onNotificationMessage` function. This is our message handler.

```html
  <div id="time" class="notification"></div>
  <script>
    function onNotificationMessage(message) {
      document.getElementById("time").innerHTML = message;
    }
  </script>
```
*API Docs:* [Notification Class](http://cdn.openfin.co/jsdocs/stable/fin.desktop.Notification.html) 

Message passing is a key component of the OpenFin API. As we continue to port web apps to OpenFin, this messaging will power cooperation between not only the elements of an app, but between the apps themselves.

### DOM Events

Event handlers and listeners make it possible to trigger application behavior in response to user behavior. We can use these events to improve our user experience starting with our Notification.

Our Notification Constructor will take a function for handling various DOM events. Let's add some `onClick` behavior to update our main window's HTML when a user clicks on a displayed notification. We can clear out the element when the notification closes using `onClose`.

```javascript
new fin.desktop.Notification({ 
  url: "sampleNotification.html",
  message: new Date().toLocaleString(),
  onClick: function () {
    document.getElementById("notificationClicked").innerHTML = "Notification Clicked";
  },
  onClose: function () {
    document.getElementById("notificationClicked").innerHTML = "";
  }
});
```
*API Docs:* [Notification Constructor](http://cdn.openfin.co/jsdocs/stable/tutorial-notification.constructor.html)

When running your applications on OpenFin remember you have access to common DOM events as well as though provided by the API.

## Data Table Tearout

Let's tie a few pieces together for some more feature rich functionality.

As our data page grows, our users will want to see several tables at once. Let's turn our 1st table into one we can drag and drop out onto the desktop from our launched window. We can execute the following code in our javascript console from our Data Window.

```javascrtipt
var myTable = document.getElementsByClassName('datatable')[0];
var hiddenTable;
var elementToCopy;
var newWindow;
var dataWindow = fin.desktop.Window.getCurrent();

function identifyDraggingElement(e){
    elementToCopy = e.target;
}

function moveToOwnWindow(){
    newWindow = new fin.desktop.Window({
        "name": new Date().toLocaleString(),
        "defaultWidth": 600,
        "defaultHeight": 300,
        "autoShow": false,
        "url": 'tearouttable.html',
        "frame": true,
        "resizable": true,
        "saveWindowState": false,
        "showTaskbarIcon": false
    }
    , function(){
        hiddenTable = this; 
        fin.desktop.System.getMousePosition(
            function(mousePosition){
                elementToCopy.parentNode.removeChild(elementToCopy);
                hiddenTable.contentWindow.document.body.appendChild(elementToCopy);
                hiddenTable.showAt(mousePosition.left - 300, mousePosition.top);
            }
        );
    });
}

myTable.addEventListener("dragend", moveToOwnWindow, false);
myTable.addEventListener("dragstart", identifyDraggingElement, false);
```
*API Docs:* [.System.getMousePosition](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_System.html#.getMousePosition)

In summary, this block:

1. Set global variables
2. `identifyDraggingElement` identifies the currently dragged element. We'll trigger this on `dragstart`.
3. `moveToOwnWindow` is triggered on `dragend`. In order this function:
    * Create a new OpenFin window for our element to be displayed in
    * Retrieve our mouse cursors position with `fin.desktop.System.getMousePosition`
    * Reparent our dragged element into our new table
    * Show our window @ our current mouse position 
4. We'll need to add the event listeners as well

### Grouping Our Windows

Rather than cluttering our desktop with individual windows we'll have to keep track of, let's group our 2 new windows.

```javascript
newWindow.joinGroup(dataWindow);
```
*API Docs:* [joinGroup](http://cdn.openfin.co/jsdocs/stable/fin.desktop.module_Window.html#joinGroup)

### Animate Our Main Window

For a more UX specific implementation, let's animate our draggable main window back to its home position. The API offers a number of transition options, let's focus on location with `position`.

Since we're still in the console with our data window, we'll load our parent window into memory first so we can pass it instructions.

```javascript
myParentWindow = fin.desktop.Window.getCurrent().getParentWindow();

myParentWindow.animate({ 
  position: {
    left: 10,
    top: 10,
    duration: 1000
  }
});
```

*API Docs:* [window.animate](http://cdn.openfin.co/jsdocs/stable/tutorial-window.animate.html)

## License
MIT

The code in this repository is covered by the included license.  If you run this code, it may call on the OpenFin RVM or OpenFin Runtime, which are subject to OpenFin’s [Developer License](https://openfin.co/developer-agreement/). If you have questions, please contact support@openfin.co

## Support
Please enter an issue in the repo for any questions or problems. Alternatively, please contact us at support@openfin.co 
