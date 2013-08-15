Install Ruby
* On windows, use RubyDevKit: http://rubyinstaller.org/downloads/
** Add ruby variables to your PATH environment variable

Install python 2.7
* Ensure Python dir is on path

Install easy_install
* https://pypi.python.org/pypi/setuptools

Install Jekyll: http://jekyllrb.com/docs/installation/
* Needed to uninstall pygments 5.2 and install 5.0: http://stackoverflow.com/questions/17364028/jekyll-on-windows-pygments-not-working

Install node:
* http://nodejs.org/download/ windows installer

Install grunt
* npm install -g grunt-cli

Bug in phantomjs:
C:\dev\skinny\node_modules\grunt-contrib-qunit\node_modules\grunt-lib-phantomjs\node_modules\phantomjs\lib\location.js is being written without escaped backslashes in windows

node-inspector --web-port=8081

Debug grunt: 
node --debug-brk C:\Users\kate\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt
