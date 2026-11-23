# Spring 3 UI

The Spring 3 UI is a static site that can sit in any Tomcat folder next to Weaver. Weaver stays a separate application at `/weaver/`. This build calls that application on the same host. The folder name is the address, for example `/spring3/`, and the same `dist` works if the folder is named something else. No second build.

<!--
In example, this server:
- UI: https://s07.circleweaver.com/spring3/
- Weaver: https://s07.circleweaver.com/weaver/
- baseURL in WEB-INF/config.txt: https://s07.circleweaver.com/weaver/
- Tomcat UI folder: /opt/tomcat/webapps/spring3/
- Tomcat ROOT: /opt/tomcat/webapps/ROOT/ (leave the existing site here)
- Weaver app: /opt/tomcat/webapps/weaver/
- libFolder: /opt/weaver_sites/
- userFolder: /opt/weaver_user/
-->

## Prerequisites

- Weaver running in Tomcat with context path `/weaver/`.
- Node.js 20.19 or newer, or 22.12 or newer. Check with `node -v`.
- npm, which comes with Node.

## Build

From the repository root:

    cd spring3
    npm ci
    npm run build

The site files are in `spring3/dist`. That folder is not committed.

## Install on Tomcat

Copy the contents of `spring3/dist` into a new Tomcat webapp folder, for example `webapps/spring3/`, so `index.html` is served at `/spring3/`. Any other folder name works with this same build. Leave `webapps/ROOT/` alone so the existing site stays up, and leave `webapps/weaver/` alone.

Do not copy `dist` into the Weaver folder. Images and `/assets/` load from the folder you copied into. API calls stay on the host at `/weaver/auth/query` and `/weaver/v/session.json`.

Open that folder, for example `http://localhost:8080/spring3/`, and sign in. Login uses the identity provider already set in Weaver's `WEB-INF/config.txt`. `baseURL` in that file should be the public Weaver address, ending in `/weaver/`.

`dist` includes a small Tomcat config so a direct visit to a client route such as `/spring3/discussions` still loads the app. That config only applies when the copy is its own webapp, which is the layout above.
