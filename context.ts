import * as React from "react";
import { ApiResolver, ApiData } from "./types";

const defaultValue = () => Promise.reject();

export const makeContext = <Data extends ApiData>() =>
  React.createContext<ApiResolver<Data>>(defaultValue as ApiResolver<Data>);
