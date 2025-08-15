import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const getUserId = (subject: string) => {
  const userIdString = subject.split("|")[0]; // because the subject returns userID | accountID
  const userID = userIdString as Id<"users">;

  return userID;
}

export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity();
    if (!currentUser) throw new Error("User is not authenticated");
 
    const userId = getUserId(currentUser.subject);
    const user = await ctx.db.get(userId);
    if (!user) return;

    await ctx.db.patch(user._id, {"name": args.name});
  },
});

// get current user table
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
   
    const userId = getUserId(identity.subject);
    const user = await ctx.db.get(userId);
    if (!user) return;

    return user;
  }
})
