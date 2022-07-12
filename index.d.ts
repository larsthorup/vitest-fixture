export type KeyValue = { [key: string]: any };
interface TestFunction<TestArgs> {
  (name: string, fn: (args: TestArgs) => Promise<void> | void): void;
}
export interface TestType<
  TestArgs extends KeyValue,
  WorkerArgs extends KeyValue
> extends TestFunction<TestArgs & WorkerArgs> {
  extend<T extends KeyValue, W extends KeyValue = {}>(
    fixtures: Fixtures<T, W, TestArgs, WorkerArgs>
  ): TestType<TestArgs & T, WorkerArgs & W>;
}
type TestFixture<R, Args extends KeyValue> = (
  args: Args,
  use: (r: R, teardown?: () => Promise<void>) => Promise<void> | void
) => any;
export type WorkerFixture<R, Args extends KeyValue> = (
  args: Args,
  use: (r: R, teardown?: () => Promise<void>) => Promise<void>
) => any;
export type TestFixtureValue<R, Args extends KeyValue> =
  | Exclude<R, Function>
  | TestFixture<R, Args>;
type WorkerFixtureValue<R, Args extends KeyValue> =
  | Exclude<R, Function>
  | WorkerFixture<R, Args>;

export type Fixtures<
  T extends KeyValue,
  W extends KeyValue,
  PT extends KeyValue,
  PW extends KeyValue
> = {
  [K in keyof PT]?: TestFixtureValue<PT[K], T & PT & PW>;
} & {
  [K in keyof T]?:
    | TestFixtureValue<T[K], T & PT & PW>
    | [TestFixtureValue<T[K], T & PT & PW>, { scope?: "test" }];
} & {
  [K in keyof PW]?: WorkerFixtureValue<PW[K], W & PW>;
} & {
  [K in keyof W]?: [WorkerFixtureValue<W[K], W & PW>, { scope: "worker" }];
};
type FixtureScope = "test" | "worker";
type FixtureOptions = { scope: FixtureScope };
export type FixtureValue<TestArgs, WorkerArgs> =
  | TestFixtureValue<any, TestArgs>
  | [TestFixtureValue<any, TestArgs>, FixtureOptions]
  | [WorkerFixtureValue<any, WorkerArgs>, FixtureOptions];
declare const test: TestType<{}, {}>;
