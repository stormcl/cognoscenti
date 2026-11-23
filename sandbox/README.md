# GitHub Pages sandbox fixtures

These files keep the demo people and workspaces on **gh-pages** only.

`spring3-ui` stays on real Weaver session data. The publish workflow checks out that branch, copies `sandbox/overlay/` over the matching paths under `spring3/src/`, builds with `VITE_SANDBOX=1`, and deploys the `dist` site back onto `gh-pages`.

The overlay also sends `/` to the UX Team home, styles workspace and discussion titles as cards/rows instead of bare links, and shortens the long org label so the switcher wraps less on small screens.

Do not open a pull request that copies this folder into `spring3-ui`.
