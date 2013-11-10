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

