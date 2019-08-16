import * as React from "react";
import { ApiResolver, ApiData } from "./types";
export declare const makeContext: <Data extends ApiData>() => React.Context<ApiResolver<Data>>;
