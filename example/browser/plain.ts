import { makeApi } from "@webcarrot/api/browser";
import { ApiData } from "../types";

const api = makeApi<ApiData>({
  endpoint: "/api",
  headers: {
    "X-Secret-Foo": "Bar"
  }
});

(async () => console.log((await api("say.hi", { who: "plain-browser" })).hi))();
