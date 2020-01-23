import { ApiResolver, ApiData } from "./types";
export declare const makeApi: <Data extends ApiData>({ endpoint, headers, batchTimeout }: {
    endpoint: string;
    headers?: HeadersInit;
    batchTimeout?: number;
}) => ApiResolver<Data>;
