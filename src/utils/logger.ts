export const log = (...args: unknown[]) => {
  if (typeof process !== 'undefined' && process.env.SILENT_LOGS === '1') return;
  // Simple wrapper so we can swap logging implementation later
  // eslint-disable-next-line no-console,@typescript-eslint/no-explicit-any
  console.log(...(args as any[]));
};
