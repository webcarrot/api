import { ApiResolver, ApiData } from "./index";

export const makeApi = <Data extends ApiData>({
  apiEndpoint,
  apiHeaders
}: {
  apiEndpoint: string;
  apiHeaders?: HeadersInit;
}): ApiResolver<Data> => {
  const headers: Headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json"
  });
  if (apiHeaders) {
    if (apiHeaders instanceof Headers) {
      apiHeaders.forEach((value, key) => headers.set(key, value));
    } else if (apiHeaders instanceof Array) {
      apiHeaders.forEach(([key, value]) => headers.set(key, value));
    } else if (apiHeaders instanceof Object) {
      Object.keys(apiHeaders).forEach(key => headers.set(key, apiHeaders[key]));
    }
  }
  return (action, payload) =>
    fetch(apiEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        action,
        payload
      })
    }).then(r => r.json());
};
