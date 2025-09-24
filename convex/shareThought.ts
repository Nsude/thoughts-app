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

    const link = `${process.env.SITE_URL}/shared/${token}`;

    await ctx.db.patch(thoughtId, {
      isPrivate: false,
      thoughtLink: link
    });

    return { link };
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
      thoughtLink: undefined
    });
  },
});

export const addSharedThoughtToDashboard = mutation({
  args: {token: v.string()},
  handler: async (ctx, {token}) => {
    const shared = await ctx.db
      .query("sharedThoughts")
      .withIndex("with_token", (q) => q.eq("token", token))
      .unique();
    
    if (!shared) throw new Error("token is invalid");
    
    const thought = await ctx.db.get(shared.thoughtId);
    if (!thought) throw new Error("ThoughtId is invalid");

    const alreadyExists = await ctx.db
      .query("thoughts")
      .withIndex("by_id", (q) => q.eq("_id", thought._id))
      .unique();

    if (alreadyExists) {
      return {thoughtId: alreadyExists._id, title: alreadyExists.description};
    }

    await ctx.db.insert("thoughts", {...thought});
    return {thoughtId: thought._id, title: thought.description};
  }
})