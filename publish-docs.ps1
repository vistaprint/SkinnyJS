git stash
git checkout gh-pages

# Convert Unix line endings to DOS for consistency
#sed -n p assets\behavior.js >assets\behavior.js"s/$//"

copy -Force -Recurse .git\docs-temp\* .

