import { Doc, Id } from "@/convex/_generated/dataModel";

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

// slate editor statuses
export type SlateStatusTypes =
  | "loading"
  | "saving"
  | "saved"
  | "unsaved_change"
  | "idle"
  | "error";

// all slate editor states
export type EditorState = {
  status: SlateStatusTypes;
  isInitialised: boolean;
  isCreatingThought: boolean;
  hasUnsavedContent: boolean;
};

// all slate editor actions
export type EditorAction =
  | { type: "INIT_CONTENT" }
  | { type: "CONTENT_LOADED" }
  | { type: "CREATING_THOUGHT" }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS" }
  | { type: "UNSAVED_CONTENT" };