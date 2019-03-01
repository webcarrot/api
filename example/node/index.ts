import * as Koa from "koa";
import { handler as build } from "./build";
import { handler as api } from "./api";
import { handler as plain } from "./plain";
import { handler as react } from "./react";

new Koa()
  .use(build)
  .use(api)
  .use(plain)
  .use(react)
  .listen(3000);
