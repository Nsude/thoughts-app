// components/InputComponent.tsx
"use client";

import { useEffect, useState } from "react";
import EyeClosed from "@/public/icons/EyeCloseIcon";
import EyeOpenIcon from "@/public/icons/EyeOpenIcon";
import { AuthType } from "../app.models";

type InputType = "firstName" | "email" | "password";

interface InputComponentProps {
  type: InputType;
  onChange: (value: string) => void;
  authType: AuthType;
  required?: boolean;
  reset: boolean;
}

const regexMap: Record<InputType, RegExp> = {
  firstName: /^[A-Za-z\s'-]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/,
};

export default function InputComponent({ type, onChange, authType, reset, required = true }: InputComponentProps) {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const placeholderMap: Record<InputType, string> = {
    firstName: "First Name",
    email: "Email",
    password: authType === "signUp" ? "Password (8chars + special char)" : "Password",
  };

  useEffect(() => {
    if (!reset) return;
    setValue("");
  }, [reset])

  const handleBlur = () => {
    setIsValid(regexMap[type].test(value));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    onChange(val);
  };

  return (
    <div className="relative w-full">
      <input
        required={required}
        type={type === "password" ? (showPassword ? "text" : "password") : type === "email" ? "email" : "text"}
        placeholder={placeholderMap[type]}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          h-[2.5625rem] w-full rounded-[0.375rem] border border-border-gray px-3 pr-10
          outline-none transition-all
          focus:ring-4 focus:ring-border-gray
        `}
        style={{borderColor: !isValid ? "#FE7A33" : ""}}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-[0.625rem] top-1/2 -translate-y-1/2"
        >
          {showPassword ? <EyeOpenIcon /> : <EyeClosed />}
        </button>
      )}
    </div>
  );
}