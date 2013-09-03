Install Ruby
* http://rubyinstaller.org/downloads/
* Add ruby bin dir to your PATH environment variable

Install RubyDevKit
* On windows, use RubyDevKit: http://rubyinstaller.org/downloads/
* Follow installation instructions: https://github.com/oneclick/rubyinstaller/wiki/Development-Kit

Install python 2.7
* http://www.python.org/getit/
** On windows, use Python 2.7.5 Windows X86-64 Installer
* Ensure Python dir is on path
** On windows, add C:\Python27;C:\Python27\Scripts

Install python easy_install
* https://pypi.python.org/pypi/setuptools (use setuptools 1.1)
* Setup instructions for windows: https://pypi.python.org/pypi/setuptools/1.1#windows

Install Pygments (python)
* http://pygments.org/download/
* easy_install Pygments

Install easy_install
* https://pypi.python.org/pypi/setuptools

Install Jekyll: http://jekyllrb.com/docs/installation/
* (windows) gem install jekyll
* (mac) sudo gem install jekyll
* Needed to uninstall pygments 5.2 and install 5.0: http://stackoverflow.com/questions/17364028/jekyll-on-windows-pygments-not-working
** gem uninstall pygments.rb --version "=0.5.2"
** gem install pygments.rb --version "=0.5.0"

Install node:
* http://nodejs.org/download/ windows installer

Install grunt
* npm install -g grunt-cli

Bug in phantomjs:
C:\dev\skinny\node_modules\grunt-contrib-qunit\node_modules\grunt-lib-phantomjs\node_modules\phantomjs\lib\location.js is being written without escaped backslashes in windows

Debugging:
* Use node-inspector
* node-inspector --web-port=8081

Debug grunt: 
node --debug-brk C:\Users\{username}\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt
