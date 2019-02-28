import * as React from "react";
import { ApiResolver, ApiData } from "./index";

const defaultValue = () => Promise.reject();

export const makeContext = <Data extends ApiData>() =>
  React.createContext<ApiResolver<Data>>(defaultValue as ApiResolver<Data>);
