export function makeAbortError(action: string | number | Symbol) {
  const error = new Error(`Action "${action}" aborted`);
  error.name = "AbortError";
  return error;
}

export function makeError(data: any, action: string | number | Symbol) {
  const error = new Error(`Action "${action}" error`);
  error.name = "ActionError";
  if (data && data instanceof Object) {
    Object.assign(error, data);
  }
  return error;
}

export function makeInvalidResponseError(action: string | number | Symbol) {
  const error = new Error(
    `Action "${action}" error due to invalid JSON in response`
  );
  error.name = "ActionError";
  return error;
}
