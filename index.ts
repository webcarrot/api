export type ActionFunction<Payload = any, Output = any, Context = any> = (
  payload: Payload,
  context: Context
) => Promise<Output>;

type Unpacked<T> = T extends Promise<infer U> ? U : T;

type Payload<T extends ActionFunction> = T extends (p: infer P, c: any) => any
  ? P
  : never;

type Output<T extends ActionFunction> = T extends (p: any, c: any) => infer R
  ? R
  : never;

export type ApiData = { [key: string]: ActionFunction };

export type ApiResolver<D extends ApiData> = <
  N extends keyof D,
  P = Payload<D[N]>,
  O = Unpacked<Output<D[N]>>
>(
  name: N,
  payload: P
) => Promise<O>;
