"use client";

import Link from "next/link";
import AuthProviderButton from "../buttons/AuthProviderButton";
import InputComponent from "./InputComponent";
import GoogleIcon from "@/public/icons/GoogleIcon";
import GithubIcon from "@/public/icons/GithubIcon";
import Logo from "../Logo";
import { AuthType, AuthFormState, authFormAction, FormProps, FormValidation } from "../app.models";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCallback, useReducer } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Toast from "../utils/Toast";
import DefaultIcon from "@/public/icons/DefaultIcon";

// ==== Auth Map ====
type AuthDetails = {
  label: string,
  submitLabel: string;
  redirect: {
    label: string;
    link: string;
    msg: string;
  }
}

const authTypeMap: Record<AuthType, AuthDetails> = {
  signUp: {
    label: "Sign up",
    submitLabel: "Sign up with email",
    redirect: {
      label: "Log in",
      link: "/login",
      msg: "Got an account?"
    }
  },
  signIn: {
    label: "Log in",
    submitLabel: "Log in with email",
    redirect: {
      label: "Sign up",
      link: "/sign-up",
      msg: "Don't have an account?"
    }
  },
}

// ==== Reducer ====
const initialState = (authType: AuthType): AuthFormState => ({
  resetForm: false,
  form: { name: "", email: "", password: "" },
  isValidProp: { name: false, email: false, password: false },
  flow: authType === "signUp" ? "signUp" : "signIn",
  emailOtp: "",
  resendTimer: 30,
  error: "",
});

function reducer(state: AuthFormState, action: authFormAction): AuthFormState {
  switch (action.type) {
    case "RESET_FORM":
      return { ...state, resetForm: action.reset };
    case "FORM":
      return { ...state, form: action.props };
    case "FORM_VALIDATION":
      return { ...state, isValidProp: action.isFormValid };
    case "FLOW":
      return { ...state, flow: action.flow as "signUp" | "signIn" | "email-verification" };
    case "EMAIL_OTP":
      return { ...state, emailOtp: action.otp };
    case "RESEND_TIMER":
      return { ...state, resendTimer: action.time };
    case "ERROR":
      return { ...state, error: action.msg };
    default:
      return state;
  }
}

interface Props {
  authType: AuthType;
}

export default function AuthForm({ authType }: Props) {
  const { signIn } = useAuthActions();
  const auth = authTypeMap[authType];
  const [state, dispatch] = useReducer(reducer, initialState(authType));
  const updateProfile = useMutation(api.users.updateProfile);
  const router = useRouter();

  const wait = 30;

  const resendCountDown = () => {
    dispatch({ type: "RESEND_TIMER", time: wait });
    let count = wait;
    const interval = setInterval(() => {
      if (count <= 0) {
        clearInterval(interval);
        return;
      }
      count = count - 1;
      dispatch({ type: "RESEND_TIMER", time: count });
    }, 1000);
  };

  const isFormValid = () => {
    if (authType === "signUp") {
      return state.isValidProp.name && state.isValidProp.email && state.isValidProp.password;
    }
    return state.isValidProp.email && state.isValidProp.password;
  };

  // initial email auth
  const emailAuth = async () => {
    if (!isFormValid()) return;
    dispatch({ type: "ERROR", msg: "" });

    try {
      await signIn("password", { email: state.form.email, password: state.form.password, flow: state.flow });
      resendCountDown();
      if (state.flow === "signUp") {
        dispatch({ type: "FLOW", flow: "email-verification" });
      }
    } catch {
      return dispatch({ type: "ERROR", msg: "invalid email or password, please try again." });
    }

    if (state.flow === "signIn") return router.replace("/thoughts/new");
  };

  // verify email
  const verifyEmail = useCallback(async () => {
    try {
      await signIn("password", { email: state.form.email, code: state.emailOtp, flow: state.flow });
      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      await updateProfile({ name: state.form.name });
      dispatch({ type: "RESET_FORM", reset: true });
      router.replace("/thoughts/new");
    } catch {
      dispatch({ type: "ERROR", msg: "Couldn't verify email at this time, try again." });
    }
  }, [state.form, state.emailOtp, state.flow, updateProfile, signIn, router]);

  const updateFormValidation = (field: keyof FormValidation, isValid: boolean) => {
    dispatch({ type: "FORM_VALIDATION", isFormValid: { ...state.isValidProp, [field]: isValid } });
  };

  return (
    <div className="flex w-full h-screen items-center p-[0.75rem]">
      <Toast
        icon={<DefaultIcon color="white" />}
        msg={state.error}
        showToast={state.error.trim() !== ""}
      />

      {/* Left side */}
      <div className="relative w-full text-center flex flex-col items-center">
        <span className="mb-[4.0625rem]">
          <Logo />
        </span>

        <div className="mb-[3.125rem]">
          <span className="text-fade-gray">Think out loud.</span>
          <h1 className="text-h1 tracking-h1 text-center mt-5">
            Great ideas don't <br /> come fully formed
          </h1>
        </div>

        <div className="flex flex-col gap-y-[1.5625rem]">
          <div className="flex gap-x-1 items-center">
            <AuthProviderButton
              label="Google"
              icon={<GoogleIcon />}
              handleClick={useCallback(() => signIn("google"), [])}
            />
            <AuthProviderButton
              label="Github"
              icon={<GithubIcon />}
              handleClick={useCallback(() => signIn("github"), [])}
            />
          </div>

          <div className="relative h-full w-full mb-[1.5625rem]">
            <div className="relative w-fit m-auto z-1 bg-off-white text-label-small uppercase text-center px-[1rem]">
              <span className="text-fade-gray">or continue with</span>
            </div>
            <span className="w-full h-0.25 bg-border-gray absolute left-0 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {state.flow === "signIn" || state.flow === "signUp" ? (
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-y-[1.25rem] mb-[1.5625rem]">
            {authType === "signUp" && (
              <InputComponent
                type={"firstName"}
                authType={authType}
                reset={state.resetForm}
                onChange={(value) => dispatch({ type: "FORM", props: { ...state.form, name: value } })}
                onValidationChange={(isValid) => updateFormValidation("name", isValid)}
              />
            )}

            <InputComponent
              type={"email"}
              authType={authType}
              reset={state.resetForm}
              onChange={(value) => dispatch({ type: "FORM", props: { ...state.form, email: value } })}
              onValidationChange={(isValid) => updateFormValidation("email", isValid)}
            />

            <InputComponent
              type={"password"}
              authType={authType}
              reset={state.resetForm}
              onChange={(value) => dispatch({ type: "FORM", props: { ...state.form, password: value } })}
              onValidationChange={(isValid) => updateFormValidation("password", isValid)}
            />

            <AuthProviderButton label={auth.submitLabel} handleClick={emailAuth} disabled={!isFormValid()} />
          </form>
        ) : (
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-y-[1.5625rem] mb-[1.5625rem]">
            <InputComponent
              type={"text"}
              placeholder="code"
              authType={authType}
              reset={true}
              onChange={(value) => dispatch({ type: "EMAIL_OTP", otp: value })}
            />
            <AuthProviderButton label={auth.submitLabel} handleClick={verifyEmail} />
          </form>
        )}

        {state.flow === "signIn" || state.flow === "signUp" ? (
          <div className="flex items-center gap-x-1">
            <span className="text-fade-gray">{auth.redirect.msg}</span>
            <Link href={auth.redirect.link} className="underline text-accent">
              {auth.redirect.label}
            </Link>
          </div>
        ) : (
          <div className="flex gap-x-1">
            <button
              onClick={emailAuth}
              disabled={state.resendTimer > 1}
              className="underline opacity-40 hover:opacity-100 transition-[opacity] duration-[200ms]"
              style={{ pointerEvents: state.resendTimer > 1 ? "none" : "all" }}
            >
              Resend
            </button>
            <span>in {state.resendTimer < 10 ? "0" : ""}{state.resendTimer}</span>
          </div>
        )}
      </div>
    </div>
  );
}
