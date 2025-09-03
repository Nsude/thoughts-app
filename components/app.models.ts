import { Doc, Id } from "@/convex/_generated/dataModel";
import { SlateStatusTypes } from "./contexts/SlateStatusContext";

// Icon models
export interface Icon {
  size?: number;
  color?: string;
  small?: boolean;
}

export type AccountTypes = "Freeloader" | "Premium";

export type AuthType = "signUp" | "login";

// thoughts
export type Thought = Doc<"thoughts">;
export type ThoughtId = Id<"thoughts">;

// versions
export type Version = Doc<"versions">;

// user
export type User = Doc<"users">;

export type EditorState = {
  status: SlateStatusTypes;
  isInitialised: boolean;
  isCreatingThought: boolean;
};

// all editor actions
export type EditorAction =
  | { type: "INIT_CONTENT" }
  | { type: "CONTENT_LOADED" }
  | { type: "CREATING_THOUGHT" }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS" };