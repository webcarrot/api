export type ActionFunction<Payload = any, Output = any, Context = any> = (
  payload: Payload,
  context: Context,
) => Promise<Output>;

export type Unpacked<T> = T extends Promise<infer U> ? U : T;

export type Payload<T extends ActionFunction> = T extends (
  p: infer P,
  c: any,
) => any
  ? P
  : never;

export type Output<T extends ActionFunction> = T extends (
  p: any,
  c: any,
) => infer R
  ? R
  : never;

export type ApiData = { [key: string]: ActionFunction };

export type PromiseA<T> = Promise<T> & {
  abort?: () => void;
};

export type ApiResolver<D extends ApiData> = <N extends keyof D>(
  action: N,
  payload: Payload<D[N]>,
  batch?: boolean,
) => PromiseA<Unpacked<Output<D[N]>>>;

export type BatchJobs<D extends ApiData, N extends keyof D> = Array<{
  action: N;
  payload: D;
  aborted: boolean;
  onSuccess: (data: Unpacked<Output<D[N]>>) => void;
  onError: (err: any) => void;
}>;

export type AddJob<D extends ApiData> = <N extends keyof D>(
  action: N,
  payload: Payload<D[N]>,
) => PromiseA<Unpacked<Output<D[N]>>>;
