import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUserHelper } from "./users";

export const shareThought = mutation({
  args: { thoughtId: v.id("thoughts") },
  handler: async (ctx, { thoughtId }) => {
    const token = crypto.randomUUID();
    const user = await getCurrentUserHelper(ctx);
    if (!user) throw new Error("this user is not signed in");

    const alreadyExists = await ctx.db
      .query("sharedThoughts")
      .withIndex("with_thoughtId", (q) => q.eq("thoughtId", thoughtId))
      .unique();

    if (alreadyExists) {
      return {
        link: `${process.env.SITE_URL}/shared/${alreadyExists.token}`,
      };
    }

    await ctx.db.insert("sharedThoughts", {
      token,
      thoughtId,
      sharedBy: user._id,
    });

    await ctx.db.patch(thoughtId, {
      isPrivate: false,
    });

    return { link: `${process.env.SITE_URL}/shared/${token}` };
  },
});

export const makePrivate = mutation({
  args: { thoughtId: v.id("thoughts") },
  handler: async (ctx, { thoughtId }) => {
    // check if the thought's been made public
    const shared = await ctx.db
      .query("sharedThoughts")
      .withIndex("with_thoughtId", (q) => q.eq("thoughtId", thoughtId))
      .unique();

    if (!shared) return;

    await ctx.db.delete(shared._id);

    await ctx.db.patch(thoughtId, {
      isPrivate: true,
    });
  },
});
