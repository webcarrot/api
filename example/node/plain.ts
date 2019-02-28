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
