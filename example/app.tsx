import * as React from "react";
import { Context as ApiContext } from "./apiContext";
import { ApiContextValue } from "./types";

const IUseApi = ({ value = "" }) => {
  const api = React.useContext(ApiContext);
  const [hi, setHi] = React.useState(value);
  return (
    <a
      onClick={() =>
        api("say.hi", { who: "React" }).then(({ hi }) => setHi(hi))
      }
    >
      Hi: ${hi}
    </a>
  );
};

export const App = ({
  api,
  hiFromServer = ""
}: {
  api: ApiContextValue;
  hiFromServer: string;
}) => {
  return (
    <ApiContext.Provider value={api}>
      <IUseApi value={hiFromServer} />
    </ApiContext.Provider>
  );
};
