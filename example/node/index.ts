import * as Koa from "koa";
import { handler as api } from "./api";
import { handler as plain } from "./plain";
import { handler as react } from "./react";

new Koa()
  .use(api)
  .use(plain)
  .use(react)
  .listen(6666);
