import { Id } from "@/convex/_generated/dataModel";

// Icon models
export interface Icon {
  size?: number;
  color?: string;
}

export type AccountTypes = "Freeloader" | "Premium";

export type AuthType = "signUp" | "login";

// thought documents
export type ThoghtDocument = Id<"thought_documents">;

// thoughts
export type Thought = Id<"thoughts">;

// versions
export type Version = Id<"versions">;