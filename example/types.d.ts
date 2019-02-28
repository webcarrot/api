import { ApiResolver } from "@webcarrot/api";
import { actions } from "./api";

export type ApiData = typeof actions;
export type ApiContextValue = ApiResolver<ApiData>;
