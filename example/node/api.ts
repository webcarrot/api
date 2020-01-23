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
        context
      });
      const {
        batch,
        action,
        payload
      }: {
        batch: any;
        action: any;
        payload: any;
      } = (await BodyParse.json(context)) || {};
      let data;
      if (batch) {
        data = await Promise.all(
          batch.map(async ({ action, payload }: any) => {
            try {
              return {
                ok: true,
                value: await api(action, payload)
              };
            } catch (err) {
              return {
                ok: false,
                value: {
                  name: err.name,
                  message: err.message
                }
              };
            }
          })
        );
      } else {
        data = await api(action, payload);
      }
      context.type = "json";
      context.status = 200;
      context.body = JSON.stringify(data);
    } catch (err) {
      context.type = "json";
      context.status = err.status || 500;
      context.body = JSON.stringify({
        name: err.name,
        message: err.message
      });
    }
  } else {
    return next();
  }
};
