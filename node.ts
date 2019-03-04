import {
  ApiResolver,
  ApiData,
  Payload,
  PromiseA,
  Unpacked,
  Output
} from "@webcarrot/api";

import { makeAbortError, makeError } from "./errors";

export const makeApi = <Data extends ApiData, Context>({
  actions,
  context
}: {
  actions: Data;
  context: Context;
}): ApiResolver<Data> => <N extends keyof Data>(
  action: N,
  payload: Payload<Data[N]>
): PromiseA<Unpacked<Output<Data[N]>>> => {
  let aborted = false;
  const promise = new Promise<Unpacked<Output<Data[N]>>>((resolve, reject) => {
    if (aborted) {
      reject(makeAbortError(action));
    } else if (action in actions) {
      actions[action](payload, context).then(
        data => {
          if (!aborted) {
            resolve(data);
          } else {
            reject(makeAbortError(action));
          }
        },
        err => reject(aborted ? makeAbortError(action) : makeError(err, action))
      );
    } else {
      reject(
        makeError(
          {
            message: `Unknown action "${action}"`,
            name: "ActionUnknown"
          },
          action
        )
      );
    }
  });
  Object.defineProperty(promise, "abort", {
    value: () => {
      aborted = true;
    }
  });
  return promise;
};
