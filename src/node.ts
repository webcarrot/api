import type {
  ApiResolver,
  ApiData,
  Payload,
  PromiseA,
  Unpacked,
  Output,
} from "./types";

import { makeAbortError, makeError } from "./errors.js";

export function makeApi<Data extends ApiData, Context>({
  actions,
  context,
}: {
  actions: Data;
  context: Context;
}): ApiResolver<Data> {
  return function <N extends keyof Data>(
    action: N,
    payload: Payload<Data[N]>
  ): PromiseA<Unpacked<Output<Data[N]>>> {
    let aborted = false;
    const promise = new Promise<Unpacked<Output<Data[N]>>>(
      (resolve, reject) => {
        if (aborted) {
          reject(makeAbortError(action));
        } else if (
          action in actions &&
          actions.hasOwnProperty(action) &&
          typeof actions[action] === "function"
        ) {
          try {
            const output = actions[action](payload, context);
            if (output instanceof Promise) {
              output.then(
                (data: Unpacked<Output<Data[N]>>) => {
                  if (!aborted) {
                    resolve(data);
                  } else {
                    reject(makeAbortError(action));
                  }
                },
                (err: any) =>
                  reject(
                    aborted ? makeAbortError(action) : makeError(err, action)
                  )
              );
            } else {
              if (!aborted) {
                resolve(output);
              } else {
                reject(makeAbortError(action));
              }
            }
          } catch (err) {
            reject(aborted ? makeAbortError(action) : makeError(err, action));
          }
        } else {
          reject(
            makeError(
              {
                message: `Unknown action "${String(action)}"`,
                name: "ActionUnknown",
              },
              action
            )
          );
        }
      }
    );
    Object.defineProperty(promise, "abort", {
      value: () => {
        aborted = true;
      },
    });
    return promise;
  };
}
