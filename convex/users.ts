import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await ctx.auth.getUserIdentity();
    if (!currentUser) throw new Error("User is not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", currentUser.email))
      .unique();

    if (!user) {
      await ctx.db.insert("users", {
        name: args.name,
        email: currentUser.email
      })

      return;
    };

    await ctx.db.patch(user._id, {"name": args.name});
  },
});
