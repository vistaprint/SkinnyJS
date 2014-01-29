grunt siteNoVerify

if ($LASTEXITCODE -ne  0)
{
    exit
}

git checkout gh-pages

if ($LASTEXITCODE -ne  0)
{
    exit
}

git fetch origin
git reset --hard origin/gh-pages

copy -Force -Recurse .git\docs-temp\* .

git add -A
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

