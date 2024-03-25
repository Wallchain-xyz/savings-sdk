import type { Address } from "viem";
import type { string as zodString, ZodType, ZodTypeDef } from "zod";
import z from "zod";

// just name it to be more verbose
export type DecimalString = `${number}`;
export type PositiveHexString = `0x${string}`;

export type { TypeOf } from "zod";

// TODO: find way to extend zod
const createDecimalStringPrecisionValidator =
  (precision: number) => (data: string) => {
    const regex = new RegExp(`^\\d+(?:\\.\\d{0,${precision}})?$`);

    return regex.test(data);
  };

const createDecimalStringZodScheme = (
  params?: Parameters<typeof zodString>[0]
) =>
  z.string(params).regex(/^\d*\.?\d*$/g) as ZodType<
    DecimalString,
    ZodTypeDef,
    string
  >;

export const zod = {
  ...z,
  positiveHexString: (params?: Parameters<typeof zodString>[0]) =>
    z
      .string({
        errorMap: () => ({
          message: "Expected format is 0x....",
        }),
        ...params,
      })
      .regex(/^0x[0-9A-Fa-f]*$/) as ZodType<
      PositiveHexString,
      ZodTypeDef,
      string
    >,
  address: (params?: Parameters<typeof zodString>[0]) =>
    z
      .string({
        errorMap: () => ({
          message: "Address must be in format 0x....",
        }),
        ...params,
      })
      .regex(/^0x[a-fA-F0-9]{40}$/g) as ZodType<Address, ZodTypeDef, string>,
  decimalString: createDecimalStringZodScheme,
  tokenAmountDecimalString: (decimals: number, max: number) =>
    z
      .string()
      .refine(
        (data) => {
          const zodScheme = createDecimalStringZodScheme();

          return zodScheme.safeParse(data);
        },
        {
          message: `Must be a proper decimal`,
        }
      )
      .refine(
        (data) => {
          const validator = createDecimalStringPrecisionValidator(decimals);

          return validator(data);
        },
        {
          message: `Must have correct precision`,
        }
      )
      // TODO: this won't work for number outside of JS safe limits
      .refine(
        (data) =>
          zod
            .number({ coerce: true })

            .min(1 / 10 ** decimals)
            .safeParse(data).success,
        {
          message: `The value is less than minimum possible value of token`,
        }
      )
      .refine(
        (data) =>
          // TODO: this won't work for number outside of JS safe limits
          zod.number({ coerce: true }).max(max).safeParse(data).success,
        {
          message: `You can not send more than you have. Please top up.`,
        }
      ),
};
