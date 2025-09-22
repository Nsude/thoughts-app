import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { User } from "./convex.model";

// get user object
export const getCurrentUserHelper = async (ctx: any): Promise<User | null> => {
  const currentUser = await ctx.auth.getUserIdentity();
  if (!currentUser) return null;

  const userId = getUserId(currentUser.subject);
  const user = await ctx.db.get(userId);

  if (!user) return null;
  return user as User;
};

// extract user id from currentUser.subject
const getUserId = (subject: string) => {
  const userIdString = subject.split("|")[0]; // because the subject returns userID | accountID
  const userID = userIdString as Id<"users">;

  return userID;
};

// get current user table
export const getCurrentUser = query({
  handler: async (ctx) => {
    return await getCurrentUserHelper(ctx);
  },
});

// add username to user table
export const updateProfile = mutation({
  args: { name: v.string(), image: v.string() },
  handler: async (ctx, {name, image}) => {
    const currentUser = await ctx.auth.getUserIdentity();
    if (!currentUser) throw new Error("User is not authenticated");

    const user = await getCurrentUserHelper(ctx);
    if (!user) return;

    await ctx.db.patch(user._id, { name, image });
  },
});