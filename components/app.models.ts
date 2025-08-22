import { DataModel, Id } from "@/convex/_generated/dataModel";

// Icon models
export interface Icon {
  size?: number;
  color?: string;
  small?: boolean
}

export type AccountTypes = "Freeloader" | "Premium";

export type AuthType = "signUp" | "login";

// thought documents
export type ThoghtDocument = DataModel["thought_documents"]["document"]

// thoughts
export type Thought = DataModel["thoughts"]["document"];

// versions
export type Version = DataModel["versions"]["document"];