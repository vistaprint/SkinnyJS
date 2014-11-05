# Installation

* Clone this git repo

* Install node:
 * http://nodejs.org/download/

* Install grunt
 * You can install grunt by using npm, run the following command: 
 * ```npm install -g grunt-cli```

* From the repo's working directory, install NPM packages
 * ```npm install```

* Before committing, run grunt (default task)
 * ```grunt```
 * This will run jshint, unit tests, etc. 
 * Pull requests must grunt successfully before they will be considered.

# Integration with pointy.js
skinny.js has a hard dependency on pointy.js, and keeps a local copy of pointy.js just as if it was a regular skinny.js module. 

To update pointy.js:

* Run ```grunt update
* Then commit any changes to pointy.js or pointy.gestures.js

# Editing the skinny.js website 
 * Use https://github.com/vistaprint/SkinnyJSSite


