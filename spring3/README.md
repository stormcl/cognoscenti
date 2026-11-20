# Spring 3 UI

The Spring 3 UI is a static site served from the host root. Weaver stays a separate Tomcat application at `/weaver/`. This build calls that application on the same host.

<!--
In example, this server:
- UI: https://s07.circleweaver.com/
- Weaver: https://s07.circleweaver.com/weaver/
- baseURL in WEB-INF/config.txt: https://s07.circleweaver.com/weaver/
- Tomcat ROOT: /opt/tomcat/webapps/ROOT/
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

Copy the contents of `spring3/dist` into Tomcat's `ROOT` webapp, so `index.html` is served at `/`.

Leave the Weaver application in its own webapp, `webapps/weaver/`. Do not copy `dist` into that folder. This build loads `/assets/` and images from the host root, and it calls `/weaver/auth/query` and `/weaver/v/session.json`.

Open the host root and sign in. Login uses the identity provider already set in `WEB-INF/config.txt`. `baseURL` in that file should be the public Weaver address, ending in `/weaver/`.

If the stock Tomcat welcome (or previous legacy build page) is still showing, rename `ROOT/index.jsp` and reload.
