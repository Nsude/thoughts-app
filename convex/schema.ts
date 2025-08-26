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
    coreThought: v.optional(v.id("thought_documents")),
    versions: v.optional(v.array(v.id("versions"))),
    isPrivate: v.boolean(),
    collaborators: v.optional(v.array(v.id("users"))),
    lastModified: v.object({
      modifiedBy: v.id("users"),
      date: v.number(),
    }),
    owner: v.id("users"),
  })
    .index("by_owner", ["owner"])
    .index("by_owner_lastModified", ["owner", "lastModified.date"])
    .index("by_owner_privacy", ["owner", "isPrivate"]),

  // ===== THOUGHT DOCUMENTS =====
  thought_documents: defineTable({
    title: v.string(),
    thoughtFileId: v.id("thoughts"),

    // raw slate JSON content
    content: v.any(),

    sourceType: v.optional(v.union(v.literal("audio"), v.literal("text"))),
  })
    .index("thoughtFileId", ["thoughtFileId"])
    .index("title", ["title"]), // for search and auto-complete

  // ===== VERSIONS =====
  versions: defineTable({
    updatedThought: v.id("thought_documents"),
    versionNumber: v.number(),
    thoughtId: v.id("thoughts"),
    changeLabel: v.union(
      v.literal("Light"),
      v.literal("Mid"),
      v.literal("Heavy")
    ),
    updatedAt: v.number(),
    modifiedBy: v.id("users"),
  })
    .index("updatedThought_date", ["updatedThought", "updatedAt"])
    .index("updatedThought_version", ["updatedThought", "versionNumber"])
    .index("modifiedBy", ["modifiedBy"]),
});

export default schema;
