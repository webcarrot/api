import { ApiResolver, ApiData } from "./";
import { makeAbortError, makeError } from "./errors";

interface FirebaseFunctions {
  httpsCallable: (action: string) => (payload: any) => Promise<any>;
}

export const makeApi = <Data extends ApiData>({
  functions
}: {
  functions: FirebaseFunctions;
}): ApiResolver<Data> => {
  return (action, payload) => {
    const promise = new Promise<any>((resolve, reject) => {
      const func = functions.httpsCallable(action as string);
      func(payload).then(
        result => {
          if (aborted) {
            reject(makeAbortError(action));
          } else {
            resolve(result.data);
          }
        },
        err => {
          if (aborted) {
            reject(makeAbortError(action));
          } else {
            reject(makeError(err, action));
          }
        }
      );
    });
    let aborted = false;
    Object.defineProperty(promise, "abort", {
      value: () => {
        if (!aborted) {
          aborted = true;
        }
      }
    });
    return promise;
  };
};
