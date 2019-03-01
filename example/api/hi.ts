import { Context as KoaContext } from "koa";
import { ActionFunction } from "@webcarrot/api";

export const action: ActionFunction<
  { who: string },
  { hi: string },
  KoaContext
> = async ({ who }, ctx) => ({
  hi: `Hi ${who} from ip: ${ctx.ip}, date: ${new Date().toLocaleString()}`
});
