import { ApiResolver, ApiData } from "./types";
interface FirebaseFunctions {
    httpsCallable: (action: string) => (payload: any) => Promise<any>;
}
export declare const makeApi: <Data extends ApiData>({ functions }: {
    functions: FirebaseFunctions;
}) => ApiResolver<Data>;
export {};
