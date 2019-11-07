import { ApiResolver, ApiData } from "./types";
import { makeAbortError, makeError } from "./errors";

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
      let aborted = false;
      const controller =
        typeof AbortController !== "undefined" ? new AbortController() : null;
      const signal = controller ? controller.signal : undefined;
      const promise = fetch(endpoint, {
        signal,
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify({
          action,
          payload
        })
      }).then(
        r =>
          r.json().then(data => {
            if (aborted) {
              throw makeAbortError(action);
            } else if (r.ok) {
              return data;
            } else {
              throw makeError(data, action);
            }
          }),
        err => {
          if (err.code === 20) {
            throw makeAbortError(action);
          } else {
            throw makeError(err, action);
          }
        }
      );
      Object.defineProperty(promise, "abort", {
        value: () => {
          if (!aborted) {
            aborted = true;
            if (controller) {
              controller.abort();
            }
          }
        }
      });
      return promise;
    } catch (err) {
      return Promise.reject(makeError(err, action));
    }
  };
};
