import * as React from "react";
import { Context as ApiContext } from "./apiContext";
import { ApiContextValue } from "./types";

type State = {
  hi: string;
  call: number;
  error: string;
};

type Action =
  | {
      type: "hi";
      value: string;
    }
  | {
      type: "call";
    }
  | {
      type: "error";
      value: string;
    };

const IUseApi = ({ value }: { value: string }) => {
  const api = React.useContext(ApiContext);
  const [{ hi, call, error }, dispatch] = React.useReducer(
    (state: State, action: Action) => {
      switch (action.type) {
        case "hi": {
          return {
            hi: action.value,
            error: null,
            call: 0
          };
        }
        case "call": {
          return {
            ...state,
            error: null,
            call: Date.now()
          };
        }
        case "error": {
          return {
            ...state,
            call: 0,
            error: action.value
          };
        }
      }
    },
    {
      hi: value,
      call: 0,
      error: null
    }
  );
  React.useEffect(() => {
    if (call) {
      const request = api("say.hi", { who: "react-browser" });
      request.then(
        ({ hi }) => dispatch({ type: "hi", value: hi }),
        err => {
          // handle only real errors
          if (err.name !== "AbortError") {
            dispatch({ type: "error", value: err.message });
          }
        }
      );
      // abort on new call or unmount
      return () => request.abort();
    }
  }, [call]);
  return (
    <div>
      <dl>
        <dt>Last message:</dt>
        <dd>{hi}</dd>
        <dt>Error:</dt>
        <dd>{error ? error : "none"}</dd>
        <dt>Status:</dt>
        <dd>{call ? "pending" : error ? "error" : "done"}</dd>
      </dl>
      <p>
        <button onClick={() => dispatch({ type: "call" })}>call api</button>
      </p>
    </div>
  );
};

export const App = ({ api, hi }: { api: ApiContextValue; hi: string }) => {
  const [show, changeShow] = React.useState(true);
  return (
    <div>
      <ApiContext.Provider value={api}>
        <p>
          <button onClick={() => changeShow(!show)}>
            {show ? "unmount" : "mount"}
          </button>{" "}
        </p>
        {show ? <IUseApi value={hi} /> : null}
      </ApiContext.Provider>
    </div>
  );
};
