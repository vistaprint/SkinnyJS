# Installation

* Install node:
 * http://nodejs.org/download/

* Install grunt
 * You can install grunt by using npm, run the following command: 
 * ```npm install -g grunt-cli```

* Install NPM packages
 * ```npm install```

# Integration with pointy.js
skinny.js has a hard dependency on pointy.js, and keeps a local copy of pointy.js just as if it was a regular skinny.js module. 

To update pointy.js:

* Run ```grunt update
* Then commit any changes to pointy.js or pointy.gestures.js

# Notes
* Debugging:
 * Use node-inspector
 * ```node-inspector --web-port=8081```

* Debug grunt: 
 * Run ```node --debug-brk C:\Users\{username}\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt```

* Working on documentation:
 * Use https://github.com/vistaprint/SkinnyJSSite

* Git (Windows only)
 * Add to git config: 
 * [core]autocrlf = true
