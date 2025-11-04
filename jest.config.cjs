/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx",
    "**/?(*.)+(spec|test).ts",
    "**/?(*.)+(spec|test).tsx",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/**/__tests__/**",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
  ],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          verbatimModuleSyntax: false,
          esModuleInterop: true,
          jsx: "react",
        },
      },
    ],
  },
  // Core 테스트는 node 환경, React 테스트는 jsdom 환경
  projects: [
    {
      displayName: "core",
      testEnvironment: "node",
      testMatch: ["<rootDir>/src/core/**/*.test.ts"],
      collectCoverageFrom: [
        "src/core/**/*.{ts,tsx}",
        "!src/core/**/*.d.ts",
        "!src/core/**/index.ts",
        "!src/core/**/__tests__/**",
      ],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: {
              verbatimModuleSyntax: false,
              esModuleInterop: true,
            },
          },
        ],
      },
    },
    {
      displayName: "react",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/src/react/**/*.test.tsx"],
      collectCoverageFrom: [
        "src/react/**/*.{ts,tsx}",
        "!src/react/**/*.d.ts",
        "!src/react/**/index.ts",
        "!src/react/**/__tests__/**",
      ],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: {
              verbatimModuleSyntax: false,
              esModuleInterop: true,
              jsx: "react",
            },
          },
        ],
      },
    },
  ],
};
