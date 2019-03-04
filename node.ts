import {
  ApiResolver,
  ApiData,
  Payload,
  PromiseA,
  Unpacked,
  Output
} from "@webcarrot/api";

const makeError = () => {
  const error = new Error("Action aborted");
  error.name === "AbortError";
  return error;
};

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
      reject(makeError());
    } else if (action in actions) {
      actions[action](payload, context).then(
        data => {
          if (!aborted) {
            resolve(data);
          } else {
            reject(makeError());
          }
        },
        err => reject(aborted ? makeError() : err)
      );
    } else {
      reject(new Error(`Unknown action ${action}`));
    }
  });
  Object.defineProperty(promise, "abort", {
    value: () => {
      aborted = true;
    }
  });
  return promise;
};
