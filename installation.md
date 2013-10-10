# Installation
Jekyll uses Pygments for syntax coloring.  Pygments requires Python and Ruby, and can be installed via easy_install.
## Initial Configuration

* Ruby
 ** Download [Ruby](http://rubyinstaller.org/downloads/)
 ** Add ruby bin dir to your PATH environment variable

* Windows - Install RubyDevKit 
** On windows, use [RubyDevKit](http://rubyinstaller.org/downloads/)
** Follow the [installation instructions](https://github.com/oneclick/rubyinstaller/wiki/Development-Kit) 

* Install Python 2.7
** Mac users should ensure they have python 2.7+ installed.
** Windows users should use the [Python 2.7.5 Windows X86-64 Installer](http://www.python.org/getit/)
** *On windows, add C:\Python27;C:\Python27\Scripts*
 

*  Install python easy_install
 ** Mac installation https://pypi.python.org/pypi/setuptools (use setuptools 1.1)
 ** *Setup instructions for windows: https://pypi.python.org/pypi/setuptools/1.1#windows*

5. Install Pygments (python)
 * http://pygments.org/download/
 * easy_install Pygments

6. Install Jekyll
 * http://jekyllrb.com/docs/installation/
 * (windows) gem install jekyll
 * (mac) sudo gem install jekyll
 * *If you need to uninstall pygments 5.2 and install 5.0:*
 * *http://stackoverflow.com/questions/17364028/jekyll-on-windows-pygments-not-working*
 * *gem uninstall pygments.rb --version "=0.5.2"*
 * *gem install pygments.rb --version "=0.5.0"*

7. Install node:
 * http://nodejs.org/download/ windows installer

8. Install grunt
 * npm install -g grunt-cli

9. Install SkinnyJS packages
 * cd to the SkinnyJS directory
 * npm install

# Notes
Debugging:
* Use node-inspector
* node-inspector --web-port=8081

Debug grunt: 
* node --debug-brk C:\Users\{username}\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt

Working on documentation:
* Make edits
* run grunt pages
** If you want to run the full distribution (i.e. you're developing scripts and want to update the site), run "grunt docs" (takes longer)
* Processed pages are updated in /site/_site
** Point a local web server to this directory to test

Git (Windows only)
* Add to git config: 

[core]
	autocrlf = true
