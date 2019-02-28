# @webcarrot/api &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/webcarrot/api/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@webcarrot/api.svg?style=flat)](https://www.npmjs.com/package/@webcarrot/api)

Tiny, isomorphic TypeScript framework to build "call action" APIs.

## Instalation

`npm i @webcarrot/api`

## Example code

See https://github.com/webcarrot/api/tree/master/example

Anyway same code:

Koa is used as context for API actions - use anything you want or nothing...

### Node side

#### Hi action (`example/api/hi.ts`):

```typescript
import { Context as KoaContext } from "koa";
import { ActionFunction } from "@webcarrot/api";

export const action: ActionFunction<
  { who: string },
  { hi: string },
  KoaContext
> = async ({ who }, ctx) => ({ hi: `Hi ${who} from ip: ${ctx.ip}` });
```

#### Actions list (`example/api/index.ts`)

```typescript
import { action as hi } from "./hi";

export const actions = {
  "say.hi": hi
};
```

#### Some definitions files (`example/types.d.ts`)

```typescript
import { ApiResolver } from "@webcarrot/api";
import { actions } from "./api";

export type ApiData = typeof actions;
export type ApiContextValue = ApiResolver<ApiData>;
```

#### Call action from koa handler (`example/node/plain.ts`)

```typescript
import { Context as KoaContext } from "koa";
import { makeApi } from "@webcarrot/api/node";
import { actions } from "../api";

export const handler = async (
  context: KoaContext,
  next: () => Promise<void>
) => {
  if (context.path === "/pain") {
    const api = makeApi<typeof actions, KoaContext>({
      actions,
      context
    });
    context.body = (await api("say.hi", { who: "anonymus" })).hi;
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
      const api = makeApi<ApiData, KoaContext>({
        actions,
        context
      });
      const {
        action,
        payload
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
        code: err.code,
        message: err.message
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
  apiEndpoint: "/api",
  apiHeaders: {
    "X-Foo": "Bar"
  }
});

(async () => console.log((await api("say.hi", { who: "anonymus" })).hi))();
```

### React

#### Make context (`example/apiContext.ts`);

```typescript
import { makeContext } from "@webcarrot/api/context";
import { ApiData } from "./types";

export const Context = makeContext<ApiData>();
```

#### Some usage (`example/app.tsx`)

```typescript
import * as React from "react";
import { Context as ApiContext } from "./apiContext";
import { ApiContextValue } from "./types";

const IUseApi = ({ value = "" }) => {
  const api = React.useContext(ApiContext);
  const [hi, setHi] = React.useState(value);
  return (
    <a
      onClick={() =>
        api("say.hi", { who: "React" }).then(({ hi }) => setHi(hi))
      }
    >
      Hi: ${hi}
    </a>
  );
};

export const App = ({
  api,
  hiFromServer = ""
}: {
  api: ApiContextValue;
  hiFromServer: string;
}) => {
  return (
    <ApiContext.Provider value={api}>
      <IUseApi value={hiFromServer} />
    </ApiContext.Provider>
  );
};
```

#### Server side

Render react app on server (`example/node/react.ts`)

```typescript
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
```

#### Browser side

Render react app in browser (`example/browser/react.ts`)

```typescript
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

declare var APP_STATE: { hiFromServer: string };

const hiFromServer =
  (typeof APP_STATE !== "undefined" && APP_STATE.hiFromServer) || "";

ReactDOM.hydrate(
  React.createElement(App, { api, hiFromServer }),
  document.getElementById("app")
);
```
