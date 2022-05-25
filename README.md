# @webcarrot/api &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/webcarrot/api/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@webcarrot/api.svg?style=flat)](https://www.npmjs.com/package/@webcarrot/api)

Tiny, isomorphic TypeScript framework to build "call action" APIs.

## Instalation

`npm i @webcarrot/api`

## General

This library provides generic TypeScript interfaces plus simple implementations / helpers for node and browsers enviroment.

```typescript
// interfaces - the essence
import { ApiResolver, ActionFunction } from "@webcarrot/api";
// implementations / helpers
import { makeApi as nodeMakeApi } from "@webcarrot/api/node";
import { makeApi as browserMakeApi } from "@webcarrot/api/browser";

type ActionContext = { context: string; zee: number };

const action: ActionFunction<
  { payload: string; foo: number },
  { output: string; bar: number },
  ActionContext
> = async ({ payload, foo }, { context, zee }) => ({
  output: `payload: ${payload} context: ${context}`,
  bar: foo + zee,
});

// Types are build from plain object like:
const actions = {
  actionName: action,
};

type Api = ApiResolver<typeof actions>;

// cusom implementation
const someCustomApiProvider: Api = (actionName, actionPayload) => {
  // call api function implementation
};

someCustomApiProvider("actionName", { payload: "c", foo: 1 }).then(
  ({ output, bar }) => console.log({ output, bar })
);

// node helper usage
const nodeApiProvider = nodeMakeApi<typeof actions, ActionContext>({
  actions,
  context: { context: "z", zee: 4 },
});

nodeApiProvider("actionName", { payload: "n", foo: 2 }).then(
  ({ output, bar }) => console.log({ output, bar })
);

// browser helper usage
const browserApiProvider = browserMakeApi<typeof actions>({
  endpoint: "/api",
  headers: {
    "X-Foo": "Bar",
  },
});

browserApiProvider("actionName", { payload: "b", foo: 3 }).then(
  ({ output, bar }) => console.log({ output, bar })
);
```

## TODO

- Allow to define an optional payload.
- Firebase helper.

## Example code

See [example code](https://github.com/webcarrot/api/tree/master/example)

Anyway same code:

Koa is used as context for API actions - use anything you want or nothing...

### Some types file (`example/types.d.ts`)

```typescript
import { ApiResolver } from "@webcarrot/api";
import { actions } from "./api";

export type ApiData = typeof actions;
export type ApiContextValue = ApiResolver<ApiData>;

export type AppState = {
  api: {
    endpoint: string;
    headers: HeadersInit;
  };
  hi: string;
};
```

### Node only side

#### Hi action (`example/api/hi.ts`)

```typescript
import { Context as KoaContext } from "koa";
import { ActionFunction } from "@webcarrot/api";

export const action: ActionFunction<
  { who: string },
  { hi: string },
  KoaContext
> = async ({ who }, ctx) => ({
  hi: `Hi ${who} from ip: ${ctx.ip}, date: ${new Date().toLocaleString()}`,
});
```

#### Actions list (`example/api/index.ts`)

```typescript
import { action as hi } from "./hi";

export const actions = {
  "say.hi": hi,
};
```

#### Call action from koa handler (`example/node/plain.ts`)

```typescript
import { Context as KoaContext } from "koa";
import { makeApi } from "@webcarrot/api/node";
import { actions } from "../api";
import { ApiData } from "../types";

export const handler = async (
  context: KoaContext,
  next: () => Promise<void>
) => {
  if (context.path === "/plain") {
    const api = makeApi<ApiData, KoaContext>({
      actions,
      context,
    });
    context.body = (await api("say.hi", { who: "plain-node" })).hi;
  } else {
    return next();
  }
};
```

#### Handle api calls in koa handler (`example/node/api.ts`)

```typescript
import { Context as KoaContext } from "koa";
import { makeApi } from "@webcarrot/api/node";
import * as BodyParse from "co-body";

import { actions } from "../api";
import { ApiData } from "../types";

export const handler = async (
  context: KoaContext,
  next: () => Promise<void>
) => {
  if (context.method === "POST" && context.path === "/api") {
    try {
      if (context.header["x-secret-foo"] !== "Bar") {
        throw new Error("Invalid secret header");
      }
      const api = makeApi<ApiData, KoaContext>({
        actions,
        context,
      });
      const {
        action,
        payload,
      }: {
        action: any;
        payload: any;
      } = (await BodyParse.json(context)) || {};
      const data = await api(action, payload);
      context.type = "json";
      context.status = 200;
      context.body = JSON.stringify(data);
    } catch (err) {
      context.type = "json";
      context.status = err.status || 500;
      context.body = JSON.stringify({
        name: err.name,
        message: err.message,
      });
    }
  } else {
    return next();
  }
};
```

### Browser side

#### Call from browser (`example/browser/plain.ts`)

```typescript
import { makeApi } from "@webcarrot/api/browser";
import { ApiData } from "../types";

const api = makeApi<ApiData>({
  endpoint: "/api",
  headers: {
    "X-Secret-Foo": "Bar",
  },
});

(async () => console.log((await api("say.hi", { who: "plain-browser" })).hi))();
```

### React

#### Make context (`example/apiContext.ts`)

```typescript
import { makeContext } from "@webcarrot/api/context";
import { ApiData } from "./types";

export const Context = makeContext<ApiData>();
```

#### React main "App" Component (`example/app.tsx`)

```typescript
import * as React from "react";
import { Context as ApiContext } from "./apiContext";
import { ApiContextValue } from "./types";

type State = {
  hi: string;
  call: number;
  error: string;
};

type Action =
  | {
      type: "hi";
      value: string;
    }
  | {
      type: "call";
    }
  | {
      type: "error";
      value: string;
    };

const IUseApi = ({ value }: { value: string }) => {
  const api = React.useContext(ApiContext);
  const [{ hi, call, error }, dispatch] = React.useReducer(
    (state: State, action: Action) => {
      switch (action.type) {
        case "hi": {
          return {
            hi: action.value,
            error: null,
            call: 0,
          };
        }
        case "call": {
          return {
            ...state,
            error: null,
            call: Date.now(),
          };
        }
        case "error": {
          return {
            ...state,
            call: 0,
            error: action.value,
          };
        }
      }
    },
    {
      hi: value,
      call: 0,
      error: null,
    }
  );
  React.useEffect(() => {
    if (call) {
      const request = api("say.hi", { who: "react-browser" });
      request.then(
        ({ hi }) => dispatch({ type: "hi", value: hi }),
        (err) => {
          // handle only real errors
          if (err.name !== "AbortError") {
            dispatch({ type: "error", value: err.message });
          }
        }
      );
      // abort on new call or unmount
      return () => request.abort();
    }
  }, [call]);
  return (
    <div>
      <dl>
        <dt>Last message:</dt>
        <dd>{hi}</dd>
        <dt>Error:</dt>
        <dd>{error ? error : "none"}</dd>
        <dt>Status:</dt>
        <dd>{call ? "pending" : error ? "error" : "done"}</dd>
      </dl>
      <p>
        <button onClick={() => dispatch({ type: "call" })}>call api</button>
      </p>
    </div>
  );
};

export const App = ({ api, hi }: { api: ApiContextValue; hi: string }) => {
  const [show, changeShow] = React.useState(true);
  return (
    <div>
      <ApiContext.Provider value={api}>
        <p>
          <button onClick={() => changeShow(!show)}>
            {show ? "unmount" : "mount"}
          </button>{" "}
        </p>
        {show ? <IUseApi value={hi} /> : null}
      </ApiContext.Provider>
    </div>
  );
};
```

#### Render react app on server (`example/node/react.ts`)

```typescript
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
    context,
  });
  const hi = (await api("say.hi", { who: "react-node" })).hi;
  const APP_STATE: AppState = {
    api: {
      endpoint: "/api",
      headers: {
        "X-Secret-Foo": "Bar",
      },
    },
    hi,
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
        hi,
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
```

#### Render react app in browser (`example/browser/react.ts`)

```typescript
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
```
