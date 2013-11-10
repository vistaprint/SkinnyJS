grunt siteNoVerify

if [ $? != 0 ]
then
    exit $?
fi

git checkout gh-pages

if [ $? != 0 ]
then
    exit $?
fi

cp -R .git\docs-temp\* .

# git add -A
# git commit -m "Updating documentation"

# if [ $? != 0 ]
# then
#     exit $?
# fi

# git push

# if [ $? != 0 ]
# then
#     exit $?
# fi

# git checkout master