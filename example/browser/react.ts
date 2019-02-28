import * as React from "react";
import * as ReactDOM from "react-dom";
import { makeApi } from "@webcarrot/api/browser";
import { ApiData } from "../types";
import { App } from "../app";

const api = makeApi<ApiData>({
  apiEndpoint: "/api",
  apiHeaders: {
    "X-Foo": "Bar"
  }
});

ReactDOM.hydrate(
  React.createElement(App, { api, hiFromServer: "" }),
  document.getElementById("app")
);
