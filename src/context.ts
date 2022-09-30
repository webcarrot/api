import { createContext } from "react";
import type { ApiResolver, ApiData } from "./types";

const defaultValue = () => Promise.reject();

export function makeContext<Data extends ApiData>() {
  return createContext<ApiResolver<Data>>(defaultValue as ApiResolver<Data>);
}
