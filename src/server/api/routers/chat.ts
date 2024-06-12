import { faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  talk: publicProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async function* ({ ctx, input }) {
      for (let i = 0; i < randomInt(20, 100); i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        yield {
          response: faker.word.noun(),
        }
      }
    }),
});