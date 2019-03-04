import { ApiResolver, ApiData } from "@webcarrot/api";

export const makeApi = <Data extends ApiData>({
  endpoint,
  headers
}: {
  endpoint: string;
  headers?: HeadersInit;
}): ApiResolver<Data> => {
  const fetchHeaders: Headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json"
  });
  if (headers) {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => fetchHeaders.set(key, value));
    } else if (headers instanceof Array) {
      headers.forEach(([key, value]) => fetchHeaders.set(key, value));
    } else if (headers instanceof Object) {
      Object.keys(headers).forEach(key => fetchHeaders.set(key, headers[key]));
    }
  }
  return (action, payload) => {
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      const promise = fetch(endpoint, {
        signal,
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({
          action,
          payload
        })
      }).then(r => r.json());
      Object.defineProperty(promise, "abort", {
        value: () => controller.abort()
      });
      return promise;
    } catch (err) {
      return Promise.reject(err);
    }
  };
};
