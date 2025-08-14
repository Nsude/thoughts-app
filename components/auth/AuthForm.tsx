// Updated AuthForm component
"use client";

import Link from "next/link";
import AuthProviderButton from "../buttons/AuthProviderButton";
import InputComponent from "./InputComponent";
import GoogleIcon from "@/public/icons/GoogleIcon";
import GithubIcon from "@/public/icons/GithubIcon";
import Logo from "../Logo";
import { AuthType } from "../app.models";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { OTPLength } from "@/convex/ResendOtp";

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
  login: {
    label: "Log in",
    submitLabel: "Log in with email",
    redirect: {
      label: "Sign up",
      link: "/sign-up",
      msg: "Don't have an account?"
    }
  },
}

interface Props {
  authType: AuthType;
}

interface myForm {
  name: string;
  email: string;
  password: string;
}

interface FormValidation {
  name: boolean;
  email: boolean;
  password: boolean;
}

export default function AuthForm({ authType }: Props) {
  const { signIn } = useAuthActions();
  const auth = authTypeMap[authType];
  const [resetForm, setResetForm] = useState(false);
  const [form, setForm] = useState<myForm>({ name: "", email: "", password: "" });
  const [formValidation, setFormValidation] = useState<FormValidation>({
    name: false,
    email: false,
    password: false
  });

  const updateProfile = useMutation(api.users.updateProfile);
  const [flow, setFlow] = useState(authType === "signUp" ? "signUp" : "signIn");
  const router = useRouter();

  const [emailOtp, setEmailOtp] = useState("");

  // Check if form is valid based on auth type
  const isFormValid = () => {
    if (authType === "signUp") {
      return formValidation.name && formValidation.email && formValidation.password;
    }
    return formValidation.email && formValidation.password;
  };

  // initial email auth
  const emailAuth = async () => {
    // Prevent execution if form is invalid
    if (!isFormValid()) return;

    await signIn("password", { email: form.email, password: form.password, flow });
    if (flow !== "signUp") return router.replace("/dashboard");
    setFlow("email-verification");
  }

  // verify email
  const verifyEmail = async () => {
    if (emailOtp.length < OTPLength) return;

    await signIn("password", {email: form.email, code: emailOtp, flow});

    await updateProfile({ name: form.name });
    setResetForm(true);
    router.replace("/dashboard");
  }

  // update the isValid status of each form field
  const updateFormValidation = (field: keyof FormValidation, isValid: boolean) => {
    setFormValidation(prev => ({
      ...prev,
      [field]: isValid
    }));
  };



  return (
    <div className="flex w-full h-screen items-center p-[0.75rem]">
      {/* Left side */}
      <div className="w-full text-center flex flex-col items-center">
        <span className="mb-[4.0625rem]">
          <Logo />
        </span>

        <div className="mb-[3.125rem]">
          <span className="text-fade-gray">Think out loud.</span>
          <h1 className="text-h1 tracking-h1 text-center mt-5">Great ideas don't <br /> come fully formed</h1>
        </div>

        <div className="flex flex-col gap-y-[1.5625rem]">
          <div className="flex gap-x-1 items-center">
            <AuthProviderButton
              label="Google"
              icon={<GoogleIcon />}
              handleClick={() => signIn("google")} />

            <AuthProviderButton
              label="Github"
              icon={<GithubIcon />}
              handleClick={() => signIn("github")} />
          </div>

          <div className="relative h-full w-full mb-[1.5625rem]">
            <div className="relative w-fit m-auto z-1 bg-off-white text-label-small uppercase text-center px-[1rem]">
              <span className="text-fade-gray">or continue with</span>
            </div>
            <span className="w-full h-0.25 bg-border-gray absolute left-0 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {
          flow === "signIn" || flow === "signUp" ?
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-y-[1.25rem] mb-[1.5625rem]">
              {/* only display firtname input on signup auth */}
              {
                authType === "signUp" &&
                <InputComponent
                  type={"firstName"}
                  authType={authType}
                  reset={resetForm}
                  onChange={(value) => setForm({ ...form, name: value })}
                  onValidationChange={(isValid) => updateFormValidation('name', isValid)} />
              }

              <InputComponent
                type={"email"}
                authType={authType}
                reset={resetForm}
                onChange={(value) => setForm({ ...form, email: value })}
                onValidationChange={(isValid) => updateFormValidation('email', isValid)} />

              <InputComponent
                type={"password"}
                authType={authType}
                reset={resetForm}
                onChange={(value) => setForm({ ...form, password: value })}
                onValidationChange={(isValid) => updateFormValidation('password', isValid)} />

              <AuthProviderButton
                label={auth.submitLabel}
                handleClick={emailAuth}
                disabled={!isFormValid()} />
            </form>
            : 
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-y-[1.5625rem]">
              <InputComponent 
                type={"text"}
                placeholder="code"
                authType={authType}
                reset={true}
                onChange={(value) => setEmailOtp(value)}

              />

              <AuthProviderButton
                label={auth.submitLabel}
                handleClick={verifyEmail} />
            </form>
        }

        <div className="flex items-center gap-x-1">
          <span className="text-fade-gray">{auth.redirect.msg}</span>
          <Link href={auth.redirect.link} className="underline text-accent">{auth.redirect.label}</Link>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full h-full bg-myGray rounded-2xl hidden xl:flex justify-center items-center">
        <span className="opacity-25 text-3xl">video</span>
      </div>
    </div>
  )
}