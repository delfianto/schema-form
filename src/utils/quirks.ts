export function assertIsError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) {
    // What a bloody absurdist way of handling types,
    // this is beyond bonkers even for a dynamic typed language.
    // In JS technically you can throw everything so need to be sure that it is an Error!
    throw new Error(`Expected Error, got: ${typeof error}`);
  }
}
