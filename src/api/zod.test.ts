import { describe, expect, it } from "vitest";

import { zod } from "./zod";

describe("zod augmentation", () => {
  const testCases = [
    {
      testName: "positiveHexString",
      method: zod.positiveHexString().safeParse,
      successCases: ["0x1234"],
      failCases: ["0x1234g", "1234", "0x|"],
    },
    {
      testName: "address",
      method: zod.address().safeParse,
      successCases: ["0xdAC17F958D2ee523a2206206994597C13D831ec7"],
      failCases: [
        "0xdAC17F958D2ee523a2206206994597C13D831ec7123123",
        "0xdAC17F958D2ee523a2206206994597C13D831ecz",
        "0adAC17F958D2ee523a2206206994597C13D831ec7",
      ],
    },
    {
      testName: "decimalString",
      method: zod.decimalString().safeParse,
      successCases: ["1234", "1234.1234"],
      failCases: ["1234.1234.1234", "1234,12341234", "0x1234"],
    },
  ];

  testCases.forEach(({ testName, method, successCases, failCases }) => {
    it(`should successfully parse ${testName}`, () => {
      successCases.forEach((input) => {
        const result = method(input);
        expect(result.success).toBe(true);
      });
    });

    it(`should fail to parse ${testName}`, () => {
      failCases.forEach((input) => {
        const result = method(input);
        expect(result.success).toBe(false);
      });
    });
  });
});
