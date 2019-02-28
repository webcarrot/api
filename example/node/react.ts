import * as React from "react";
import * as ReactDOM from "react-dom/server";
import { Context as KoaContext } from "koa";
import { makeApi } from "@webcarrot/api/node";

import { actions } from "../api";
import { App } from "../app";
import { ApiData } from "../types";

export const handler = async (context: KoaContext) => {
  const api = makeApi<ApiData, KoaContext>({
    actions,
    context
  });
  context.body = ReactDOM.renderToString(
    React.createElement(App, {
      api
    })
  );
};
