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
    collaborators: v.optional(v.array(v.id("user"))),
    lastModified: v.optional(
      v.object({
        modifiedBy: v.id("users"),
        date: v.number(),
      })
    ),
    owner: v.id("user"),
  })
    .index("by_owner", ["owner"])
    .index("by_owner_lastModified", ["owner", "lastModified.date"])
    .index("by_owner_privacy", ["owner", "isPrivate"]),

  // ===== THOUGHT DOCUMENTS =====
  thought_documents: defineTable({
    title: v.string(),
    thoughtFileId: v.id("thoughts"),
    blocks: v.array(
      v.object({
        id: v.string(),
        type: v.union(
          // can be one of these
          v.literal("paragraph"),
          v.literal("heading"),
          v.literal("bulletList"),
          v.literal("numberedList"),
          v.literal("tip"),
          v.literal("highlight")
        ),
        content: v.string(),
        metadata: v.optional(
          v.object({
            level: v.optional(v.number()), // for headings
            items: v.optional(v.array(v.string())), // for lists
            highlighted: v.optional(v.boolean()),
            comments: v.optional(v.array(v.string())),
          })
        ),
      })
    ),
    sourceType: v.union(v.literal("audio"), v.literal("text")),
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