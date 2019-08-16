import { ApiResolver, ApiData } from "./types";
export declare const makeApi: <Data extends ApiData, Context>({ actions, context }: {
    actions: Data;
    context: Context;
}) => ApiResolver<Data>;
