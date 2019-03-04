export const makeAbortError = (action: string | number | Symbol) => {
  const error = new Error(`Action "${action}" aborted`);
  error.name = "AbortError";
  return error;
};

export const makeError = (data: any, action: string | number | Symbol) => {
  const error = new Error((data && data.message) || `Action "${action}" error`);
  error.name = (data && data.name) || "ActionError";
  return error;
};
