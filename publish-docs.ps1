grunt docs

if ($LASTEXITCODE -ne  0)
{
    exit
}

git checkout gh-pages

if ($LASTEXITCODE -ne  0)
{
    exit
}

copy -Force -Recurse .git\docs-temp\* .

pause

git add .
git commit -m "Updating documentation"

if ($LASTEXITCODE -ne  0)
{
    exit
}

git push

if ($LASTEXITCODE -ne  0)
{
    exit
}

git checkout master

