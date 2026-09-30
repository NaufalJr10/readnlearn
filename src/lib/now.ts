/** Wall-clock time for server components; kept behind a function so render code stays lint-pure. */
export const nowMs = () => Date.now();
