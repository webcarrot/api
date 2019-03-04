import * as React from "react";
import * as ReactDOM from "react-dom";
import { makeApi } from "@webcarrot/api/browser";
import { ApiData, AppState } from "../types";
import { App } from "../app";

declare var APP_STATE: AppState;
const { api: apiConf, hi } = APP_STATE;

const api = makeApi<ApiData>(apiConf);

ReactDOM.hydrate(
  React.createElement(App, { api, hi }),
  document.getElementById("app")
);
