import * as React from "react";
import * as ReactDOM from "react-dom/server";
import { Context as KoaContext } from "koa";
import { makeApi } from "@webcarrot/api/node";

import { actions } from "../api";
import { App } from "../app";
import { ApiData, AppState } from "../types";

export const handler = async (context: KoaContext) => {
  const api = makeApi<ApiData, KoaContext>({
    actions,
    context
  });
  const hi = (await api("say.hi", { who: "react-node" })).hi;
  const APP_STATE: AppState = {
    api: {
      endpoint: "/api",
      headers: {
        "X-Secret-Foo": "Bar"
      }
    },
    hi
  };
  context.body = `<!doctype html>
<html>
  <head>
    <title>Example</title>
  </head>
  <body>
    <div id="app">${ReactDOM.renderToString(
      React.createElement(App, {
        api,
        hi
      })
    )}</div>
    <script src="https://unpkg.com/react@16.8.3/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@16.8.3/umd/react-dom.production.min.js"></script>
    <script>window.process={env:{NODE_ENV:"production"}};APP_STATE=${JSON.stringify(
      APP_STATE
    )};</script>
    <script src="/build/react.js" async defer></script>
  </body>
</html>`;
};
