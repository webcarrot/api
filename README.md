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
  ({ output, bar }) => console.log({ output, bar }),
);

// node helper usage
const nodeApiProvider = nodeMakeApi<typeof actions, ActionContext>({
  actions,
  context: { context: "z", zee: 4 },
});

nodeApiProvider("actionName", { payload: "n", foo: 2 }).then(
  ({ output, bar }) => console.log({ output, bar }),
);

// browser helper usage
const browserApiProvider = browserMakeApi<typeof actions>({
  endpoint: "/api",
  headers: {
    "X-Foo": "Bar",
  },
});

browserApiProvider("actionName", { payload: "b", foo: 3 }).then(
  ({ output, bar }) => console.log({ output, bar }),
);
```
