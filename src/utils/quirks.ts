export function assertIsError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) {
    // -- Begin Rant --
    // What a bloody absurdist way of handling types,
    // this is beyond bonkers even for a dynamic typed language.
    // In JS technically you can throw everything so need to be sure that it is an Error!
    //
    // This is what Claude even says:
    // So yes, JavaScript really is that kind of language -
    // the kind where you can throw an integer and watch the world burn! 🔥
    //
    // It's one of those "JavaScript moments" that makes developers from other
    // languages question their life choices. You're absolutely right to be bewildered by this!
    // -- End Rant --
    throw new Error(`Expected Error, got: ${typeof error}`);
  }
}
