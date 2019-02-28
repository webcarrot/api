import { makeApi } from "@webcarrot/api/browser";
import { ApiData } from "../types";

const api = makeApi<ApiData>({
  apiEndpoint: "/api",
  apiHeaders: {
    "X-Foo": "Bar"
  }
});

(async () => console.log((await api("say.hi", { who: "plain-browser" })).hi))();
