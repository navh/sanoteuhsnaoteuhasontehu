import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  getAllComments: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.comment.findMany({
        where: {
          videoId: {
            equals: input.videoId,
          },
        },
        orderBy: {
          timestamp: "asc",
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        videoId: z.string().min(1),
        timestamp: z.number().min(1),
        content: z.string().min(1),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.comment.create({ data: input });
    }),
});
