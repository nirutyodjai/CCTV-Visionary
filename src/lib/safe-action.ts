// Simplified safe action creator
import { z } from 'zod';

export const action = <TInput extends z.ZodType<any, any, any>, TOutput>(
  schema: TInput,
  handler: (input: z.infer<TInput>) => Promise<TOutput>
) => {
  return async (input: z.infer<TInput>): Promise<TOutput> => {
    const parsedInput = schema.safeParse(input);
    if (!parsedInput.success) {
      throw new Error("Invalid input");
    }
    return handler(parsedInput.data);
  };
};
