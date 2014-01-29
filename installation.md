# Installation

Note: Jekyll uses Pygments for syntax coloring.  Pygments requires Python and Ruby, and can be installed via easy_install.

## Initial Configuration

* Install [Ruby](http://rubyinstaller.org/downloads/)
 * Add ruby bin dir to your PATH environment variable
 * Mac users should have Ruby installed already

* Install RubyDevKit on Windows
 * On windows, use [RubyDevKit](http://rubyinstaller.org/downloads/)
 * Follow the [installation instructions](https://github.com/oneclick/rubyinstaller/wiki/Development-Kit) 

* Install Python 2.7
 * Mac users should ensure they have python 2.7+ installed.
 * Windows users should use the [Python 2.7.5 Windows X86-64 Installer](http://www.python.org/getit/). *On windows, add C:\Python27;C:\Python27\Scripts to your PATH*

*  Install python easy_install
 * Mac installation (use setuptools 1.1): https://pypi.python.org/pypi/setuptools
 * Windows installation: https://pypi.python.org/pypi/setuptools/1.1#windows

* Install [Pygments](http://pygments.org/download/) (Python)
 * Run ```easy_install Pygments```

* Install [Jekyll](http://jekyllrb.com/docs/installation/)
 * Windows: ```gem install jekyll```
 * Mac: ```sudo gem install jekyll```
 * _If you need to uninstall pygments 5.2 and install 5.0:_
 * *http://stackoverflow.com/questions/17364028/jekyll-on-windows-pygments-not-working*
 * ```gem uninstall pygments.rb --version "=0.5.2"```
 * ```gem install pygments.rb --version "=0.5.0"```

* Install node:
 * http://nodejs.org/download/

* Install grunt
 * You can install grunt by using npm, run the following command: 
 * ```npm install -g grunt-cli```

* Install SkinnyJS packages
 * cd to the SkinnyJS directory
 * ```npm install```

# Notes
* Debugging:
 * Use node-inspector
 * ```node-inspector --web-port=8081```

* Debug grunt: 
 * Run ```node --debug-brk C:\Users\{username}\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt```

* Working on documentation:
 * Make edits
 * run ```grunt sitePages```
 * If you want to run the full distribution (i.e. you're developing scripts and want to update the site), run ```grunt site``` (takes longer)
 * Processed pages are updated in /site/_site
 * Point a local web server to this directory to test

* Git (Windows only)
 * Add to git config: 
 * [core]autocrlf = true
