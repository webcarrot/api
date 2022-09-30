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
