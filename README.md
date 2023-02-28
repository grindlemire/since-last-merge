# since-last-merge

## Features

This extension will provide a flat list of the files that you have changed since your last merge with a target upstream branch. This is super useful if you are in a mono repo and the files you are editing in a single PR are far apart.

Notably, this is different from the existing git/scm integration because that will only show you uncommitted work, since-last-merge will continue to show changes until you merge your branch into the upstream branch.


## Extension Settings

-   `SinceLastMerge.remoteName`: The name of your configured remote. Defaults to `origin`
-   `SinceLastMerge.remoteBranch`: The name of the branch in your remote that you want to track. Defaults to `main`
