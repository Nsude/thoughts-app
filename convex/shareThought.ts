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

export const updateThoughtCollaborators = mutation({
  args: {token: v.string()},
  handler: async (ctx, {token}) => {
    const user = await getCurrentUserHelper(ctx);
    if (!user) throw new Error("this user is not signed in");
    const {_id: userId} = user;

    const shared = await ctx.db
      .query("sharedThoughts")
      .withIndex("with_token", (q) => q.eq("token", token))
      .unique();

    if (!shared) throw new Error("token is invalid");

    const thought = await ctx.db.get(shared.thoughtId);
    if (!thought) throw new Error("ThoughtId is invalid");

    // If already a collaborator, just return
    if (thought.owner === userId || thought.collaborators?.includes(userId)) {
      return { thoughtId: thought._id, title: thought.description };
    }

    // Add them as a collaborator
    await ctx.db.patch(thought._id, {
      collaborators: [...(thought.collaborators ?? []), userId],
    });

    return { thoughtId: thought._id, title: thought.description };
  }
})