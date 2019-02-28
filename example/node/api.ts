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
