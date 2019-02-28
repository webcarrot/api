import { ApiResolver, ApiData } from "./index";

export const makeApi = <Data extends ApiData, Context>({
  actions,
  context
}: {
  actions: Data;
  context: Context;
}): ApiResolver<Data> => async (action, payload) => {
  if (action in actions) {
    return await actions[action](payload, context);
  } else {
    throw new Error(`Unknown action ${action}`);
  }
};
