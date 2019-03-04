import * as React from "react";
import { Context as ApiContext } from "./apiContext";
import { ApiContextValue } from "./types";

const IUseApi = ({ value = "" }) => {
  const api = React.useContext(ApiContext);
  const [hi, setHi] = React.useState(value);
  return (
    <p>
      Last message: <strong>{hi}</strong>
      <button
        onClick={() =>
          api("say.hi", { who: "react-browser" }).then(({ hi }) => setHi(hi))
        }
      >
        say hi
      </button>
    </p>
  );
};

export const App = ({ api, hi = "" }: { api: ApiContextValue; hi: string }) => {
  return (
    <ApiContext.Provider value={api}>
      <IUseApi value={hi} />
    </ApiContext.Provider>
  );
};
