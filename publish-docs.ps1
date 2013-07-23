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

# Convert Unix line endings to DOS for consistency
#sed -n p assets\behavior.js >assets\behavior.js"s/$//"

copy -Force -Recurse .git\docs-temp\* .

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

