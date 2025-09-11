import { Doc, Id } from "@/convex/_generated/dataModel";

// Icon models
export interface Icon {
  size?: number;
  color?: string;
  small?: boolean;
}

export type AccountTypes = "Freeloader" | "Premium";

// Auth form types
export interface FormProps {
  name: string;
  email: string;
  password: string;
}

export interface FormValidation {
  name: boolean;
  email: boolean;
  password: boolean;
}

export type AuthType = "signUp" | "signIn";
export type AuthFlow = "signUp" | "signIn" | "email-verification";

export type AuthFormState = {
  resetForm: boolean,
  form: FormProps,
  isValidProp: FormValidation,
  flow: AuthFlow,
  emailOtp: string,
  resendTimer: number,
  error: string,
  pressedAuthButtonId: string,
  status: ButtonStatus
}

export type authFormAction = 
| {type: "RESET_FORM", reset: boolean}
| {type: "FORM", props: FormProps}
| {type: "FORM_VALIDATION", isFormValid: FormValidation}
| {type: "FLOW", flow: AuthFlow}
| {type: "EMAIL_OTP", otp: string}
| {type: "RESEND_TIMER", time: number}
| {type: "ERROR", msg: string}
| {type: "PRESSED_AUTH_BUTTON", targetId: string}
| {type: "STATUS", status: ButtonStatus}

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
  | "deleting"
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

// Audio modal (used in the parent component)
export type AudioModalState = {
  display: boolean;
  startRecording: boolean;
  targetId: string,
  status: ButtonStatus
};

export type AudioModalAction =
  | { type: "DISPLAY"; display: boolean }
  | { type: "START_RECORDING"; start: boolean }
  | { type: "PRESSED_BUTTON"; targetId: string }
  | { type: "STATUS"; status: ButtonStatus }


// The actual audio component state
export type AudioComponentState = {
  recordingTime: number
}

export type AudioComponentAction = 
| {type: "RECORDING_TIME", time: number}


// button status
export type ButtonStatus = "idle" | "loading" | "error";