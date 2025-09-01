import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getCurrentUserHelper } from "./users";

// create a new thought
export const createNewThought = mutation({
  args: {
    isPrivate: v.boolean(),
    description: v.optional(v.string())
  }, 
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity();
    if (!currentUser) throw new Error("this User is not signed in");

    const user = await getCurrentUserHelper(ctx);
    if (!user) return;

    return await ctx.db.insert("thoughts", {
      owner: user._id,
      isPrivate: args.isPrivate,
      description: args.description,
      lastModified: {
        modifiedBy: user._id,
        date: Date.now()
      }
    })
  }
});


// create a new thought document
export const createNewDocument = mutation({
  args: {
    title: v.string(),
    thoughtFileId: v.id("thoughts"),
    content: v.any(),
    sourceType: v.optional(v.union(v.literal("audio"), v.literal("text")))
  }, 
  handler: async (ctx, args) => {
    const user = await getCurrentUserHelper(ctx);
    if (!user) throw new Error("this user is not signed in");

    return await ctx.db.insert("thought_documents", {
      title: args.title,
      thoughtFileId: args.thoughtFileId,
      content: args.content, 
      sourceType: args.sourceType || "text"
    })
  }
})

// auto save / update a thought file
export const updateThought = mutation({
  args: {
    newContent: v.any(),
    documentId: v.id("thought_documents"),
    thoughtId: v.id("thoughts")
  }, 
  handler: async (ctx, args) => {
    const user = await getCurrentUserHelper(ctx);
    if (!user) throw new Error("this user is not signed in");

    await ctx.db.patch(args.documentId, {
      content: args.newContent
    })

    await ctx.db.patch(args.thoughtId, {
      lastModified: {
        modifiedBy: user._id,
        date: Date.now()
      }
    })
  }
}) 

// set the core thought document of each thought file
export const setCoreThought = mutation({
  args: {
    thoughtId: v.id("thoughts"),
    coreThought: v.id("thought_documents")
  },
  handler: async (ctx, {thoughtId, coreThought}) => {
    try {
      const thought = await ctx.db.get(thoughtId);
      if (!thought) throw new Error("Core thought error: Thought file does not exist");
  
      const user = await getCurrentUserHelper(ctx);
      if (!user) throw new Error("Auth error: user not signed in");

      ctx.db.patch(thoughtId, {
        coreThought,
        lastModified: {
          modifiedBy: user._id,
          date: Date.now()
        }
      })
    } catch (error) {
      console.error(error);
    }
  }
})

// fetch user thoughts
export const getUserThoughts = query({
  args: {isPrivate: v.boolean()},
  handler: async (ctx, {isPrivate}) => {
    try {
      const user = await getCurrentUserHelper(ctx);
      if (!user) throw new Error("this user is not signed in");
  
      let thoughts = await ctx.db
        .query("thoughts")
        .withIndex("by_owner", (q) => q.eq("owner", user._id))
        .filter((q) => q.eq(q.field("isPrivate"), isPrivate))
        .collect();
  
      if (!thoughts) return [];
  
      return thoughts;
    } catch (error) {
      console.error("Error fetching thoughts: ", error);
    }
  }
}) 

// get the selected thought with it's core document
export const getThoughtWithDocument = query({
  args: {thoughtId: v.id("thoughts")},
  handler: async (ctx, {thoughtId}) => {
    const thought = await ctx.db.get(thoughtId);
    if (!thought) return;

    let document = null;
    if (thought.coreThought) {
      document = await ctx.db.get(thought.coreThought);
    }

    return {
      ...thought,
      document
    }
  } 
})

// delete a thought
export const deleleThought = mutation({
  args: {thoughtId: v.id("thoughts")},
  handler: async (ctx, {thoughtId}) => {
    try {   
      const thought = await ctx.db.get(thoughtId);
      if (!thought) throw new Error("Delete error, thought file does not exist");
  
      await ctx.db.delete(thoughtId);
    } catch (error) {
      console.error(error) ;
    }
  }
})

// rename a thought 
export const renameThought = mutation({
  args: {
    newTitle: v.string(),
    thoughtId: v.id("thoughts")
  },
  handler: async (ctx, {newTitle, thoughtId}) => {
    try {
      const thought = await ctx.db.get(thoughtId);
      const user = await getCurrentUserHelper(ctx);
      if (!thought || !user) throw new Error("Rename error, thought file does not exist");
  
      await ctx.db.patch(thoughtId, {
        description: newTitle,
        lastModified: {
          modifiedBy: user._id,
          date: Date.now()
        }
      })
    } catch (error) {
      console.error(error);
    }
  }
})