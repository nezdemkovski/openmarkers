import { z } from "zod";

export const sexEnum = z.enum(["M", "F"]);
export const biomarkerTypeEnum = z.enum(["quantitative", "qualitative"]);
export const publicHandleSchema = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "Lowercase alphanumeric and hyphens, must start/end with alphanumeric");

export const importDataSchema = z.object({
  user: z.object({
    name: z.string().min(1).max(200),
    dateOfBirth: z.string().date().optional(),
    sex: sexEnum.optional(),
  }),
  categories: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        biomarkers: z
          .array(
            z.object({
              id: z.string().min(1).max(200),
              unit: z.string().max(50).nullish(),
              refMin: z.number().nullish(),
              refMax: z.number().nullish(),
              type: biomarkerTypeEnum.optional(),
              results: z
                .array(
                  z.object({
                    date: z.string().date(),
                    value: z.union([z.number(), z.string().max(200)]),
                  }),
                )
                .max(10000),
            }),
          )
          .max(500),
      }),
    )
    .max(100),
});
