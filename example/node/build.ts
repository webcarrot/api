import { Context as KoaContext } from "koa";
import { createReadStream } from "fs";
import { join } from "path";

export const handler = async (
  context: KoaContext,
  next: () => Promise<void>
) => {
  if (context.method === "GET" && context.path === "/build/react.js") {
    context.type = "application/javascript";
    context.body = createReadStream(join(__dirname, "../build/react.js"));
  } else {
    return next();
  }
};
