module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts", ".mts"],
  transform: {
    "^.+\\.(ts|mts|tsx)$": ["ts-jest", { useESM: true }],
  },
  testMatch: [
    "**/tests/**/*.test.mts",
    "**/tests/**/*.test.ts",
    "**/?(*.)+(spec|test).mts",
  ],
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "mts",
    "tsx",
    "json",
    "node",
  ],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.jest.json",
    },
  },
};
