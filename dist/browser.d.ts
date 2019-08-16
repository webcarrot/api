import { ApiResolver, ApiData } from "./types";
export declare const makeApi: <Data extends ApiData>({ endpoint, headers }: {
    endpoint: string;
    headers?: HeadersInit;
}) => ApiResolver<Data>;
