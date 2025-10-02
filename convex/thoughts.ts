import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserHelper } from "./users";
import { Id } from "./_generated/dataModel";

// create a new thought
export const createThought = mutation({
  args: {
    isPrivate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity();
    if (!currentUser) throw new Error("this User is not signed in");

    const user = await getCurrentUserHelper(ctx);
    if (!user) return;

    return await ctx.db.insert("thoughts", {
      owner: user._id,
      isPrivate: args.isPrivate,
      lastModified: {
        modifiedBy: user._id,
        date: Date.now(),
      },
    });
  },
});

// create a new version
export const createVersion = mutation({
  args: {
    thoughtId: v.id("thoughts"),
    content: v.any(),
    versionNumber: v.number(),
    isCore: v.boolean(),
    createdAt: v.number(),
    parentVersionNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserHelper(ctx);
    if (!user) throw new Error("This user is not signed in");

    return await ctx.db.insert("versions", {
      ...args,
      modifiedBy: user._id,
      changeLabel: "Light",
      title: `Version ${args.versionNumber < 10 ? 0 : ""}${args.versionNumber}`,
    });
  },
});

// get thought
export const getCurrentThought = query({
  args: {thoughtId: v.id("thoughts")},
  handler: async (ctx, {thoughtId}) => {
    try {
      const thought = await ctx.db.get(thoughtId);
      if (!thought) throw new Error("error getting current thought, thoughId is invalid");
      
      return thought;
    } catch (error) {
      console.error(error) 
    }

  }
})

// get versions
export const getThoughtVersions = query({
  args: { thoughtId: v.id("thoughts") },
  handler: async (ctx, { thoughtId }) => {
    const versions = await ctx.db
      .query("versions")
      .withIndex("by_thought_version", (q) => q.eq("thoughtId", thoughtId))
      .collect();

    return versions;
  },
});

// auto save / update a thought file
export const updateThought = mutation({
  args: {
    newContent: v.any(),
    thoughtId: v.id("thoughts"),
  },
  handler: async (ctx, { newContent, thoughtId }) => {
    try {
      const user = await getCurrentUserHelper(ctx);
      if (!user) throw new Error("AutoSave Error: this user is not signed in");

      const thought = await ctx.db.get(thoughtId);
      if (!thought?.selectedVersion)
        throw new Error("Error saving content, thought does not exist");

      await ctx.db.patch(thought.selectedVersion, {
        content: newContent,
      });

      await ctx.db.patch(thoughtId, {
        lastModified: {
          modifiedBy: user._id,
          date: Date.now(),
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
});

// set the core version of each thought file
export const setSelectedVersion = mutation({
  args: {
    thoughtId: v.id("thoughts"),
    selectedVersion: v.id("versions"),
  },
  handler: async (ctx, { thoughtId, selectedVersion }) => {
    try {
      const thought = await ctx.db.get(thoughtId);
      if (!thought)
        throw new Error("Core thought error: Thought file does not exist");

      const user = await getCurrentUserHelper(ctx);
      if (!user) throw new Error("Auth error: user not signed in");

      ctx.db.patch(thoughtId, {
        selectedVersion,
        lastModified: {
          modifiedBy: user._id,
          date: Date.now(),
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
});

// fetch user thoughts
export const getUserThoughts = query({
  handler: async (ctx) => {
    const user = await getCurrentUserHelper(ctx);
    if (!user) throw new Error("this user is not signed in");

    const ownedThoughts = await ctx.db
      .query("thoughts")
      .withIndex("by_owner", (q) => q.eq("owner", user._id))
      .collect();

    const collaboratedThoughts = await ctx.db
      .query("thoughts")
      .filter((q) => q.eq(q.field("collaborators"), [user._id]))
      .collect();

    // Merge and deduplicate (in case someone is both owner + collaborator)
    const thoughtsMap = new Map();
    const allThoughts = [...ownedThoughts, ...collaboratedThoughts];
    allThoughts.forEach( (t) => thoughtsMap.set(t._id, t) );

    return Array.from(thoughtsMap.values());
  },
});

// get the selected version of the current thought
export const getSelectedVersion = query({
  args: {
    thoughtId: v.id("thoughts"),
  },
  handler: async (ctx, { thoughtId }) => {
    const thought = await ctx.db.get(thoughtId);
    if (!thought?.selectedVersion) return;

    const versionId = thought.selectedVersion as Id<"versions">;

    const selectedVersion = await ctx.db.get(versionId);

    return selectedVersion;
  },
});

// update version numbers on delete
const updateVersionNumbersInternal = async (
  ctx: any,
  thoughtId: Id<"thoughts">
) => {
  const versions = await ctx.db
    .query("versions")
    .withIndex("by_thought_version", (q: any) => q.eq("thoughtId", thoughtId))
    .collect();

  if (!versions || versions.length === 0) return;

  const nonCoreVersions = versions.filter((v: any) => !v.isCore);
  nonCoreVersions.sort((a:any, b: any) => a.createdAt - b.createdAt);

  for (let i = 0; i < nonCoreVersions.length; i++) {
    const newVersionNumber = i + 2;
    if (nonCoreVersions[i].versionNumber !== newVersionNumber) {
      await ctx.db.patch(nonCoreVersions[i]._id, {
        versionNumber: newVersionNumber,
      });
    }
  }
};

// delete a version
export const deleleVersion = mutation({
  args: { thoughtId: v.id("thoughts") },
  handler: async (ctx, { thoughtId }) => {
    const thought = await ctx.db.get(thoughtId);
    if (!thought) throw new Error("delete error, thought does not exist");

    const versionId = thought.selectedVersion;
    if (!versionId) return;

    await ctx.db.delete(versionId);
    await updateVersionNumbersInternal(ctx, thoughtId);
  },
});

// delete a thought
export const deleleThought = mutation({
  args: { thoughtId: v.id("thoughts") },
  handler: async (ctx, { thoughtId }) => {
    await ctx.db.delete(thoughtId);
  },
});

// rename a thought
export const renameThought = mutation({
  args: {
    newTitle: v.string(),
    thoughtId: v.id("thoughts"),
  },
  handler: async (ctx, { newTitle, thoughtId }) => {
    try {
      const thought = await ctx.db.get(thoughtId);
      const user = await getCurrentUserHelper(ctx);
      if (!thought || !user)
        throw new Error("Rename error, thought file does not exist");

      await ctx.db.patch(thoughtId, {
        description: newTitle,
        lastModified: {
          modifiedBy: user._id,
          date: Date.now(),
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
});
