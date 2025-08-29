import { Doc, Id } from "@/convex/_generated/dataModel";

// Icon models
export interface Icon {
  size?: number;
  color?: string;
  small?: boolean
}

export type AccountTypes = "Freeloader" | "Premium";

export type AuthType = "signUp" | "login";

// thought documents
export type ThoghtDocument = Doc<"thought_documents">;

// thoughts
export type Thought = Doc<"thoughts">;
export type ThoughtId = Id<"thoughts">;

// versions
export type Version = Doc<"versions">;

// user
export type User = Doc<"users">;