import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    // default fields
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // other "users" fields...
    accountType: v.optional(
      v.union(v.literal("Freeloader"), v.literal("Premium"))
    ),
  }).index("email", ["email"]),

  // ===== THOUGHTS =====
  thoughts: defineTable({
    description: v.optional(v.string()),
    selectedVersion: v.optional(v.id("versions")), // last displayed version
    isPrivate: v.boolean(),
    collaborators: v.optional(v.array(v.id("users"))),
    lastModified: v.object({
      modifiedBy: v.id("users"),
      date: v.number(),
    }),
    owner: v.id("users"),
    thoughtLink: v.optional(v.string())
  })
    .index("by_owner", ["owner"])
    .index("by_collaborators", ["collaborators"])
    .index("by_owner_privacy", ["owner", "isPrivate"]),

  // ===== VERSIONS =====
  versions: defineTable({
    thoughtId: v.id("thoughts"),
    content: v.any(), // raw slate JSON content
    versionNumber: v.number(),
    title: v.string(),
    changeLabel: v.union(
      v.literal("Light"),
      v.literal("Mid"),
      v.literal("Heavy")
    ),
    isCore: v.boolean(), // Is this the original/core version?
    createdAt: v.number(),
    modifiedBy: v.id("users"),
    parentVersionNumber: v.optional(v.number()),
  })
    // query by thoughtId and versionNumber for returning a specific version
    .index("by_thought_version", ["thoughtId", "versionNumber"])
    .index("by_modifiedBy", ["modifiedBy"]),

  // shared thoughts
  sharedThoughts: defineTable({
    token: v.string(),
    thoughtId: v.id("thoughts"),
    sharedBy: v.id("users"),
    expiresAt: v.optional(v.number())
  })
  .index("with_token", ["token"])
  .index("with_thoughtId", ["thoughtId"])
});

export default schema;
