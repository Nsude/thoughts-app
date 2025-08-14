// Updated InputComponent with validation callback
"use client";

import { useEffect, useState } from "react";
import EyeClosed from "@/public/icons/EyeCloseIcon";
import EyeOpenIcon from "@/public/icons/EyeOpenIcon";
import { AuthType } from "../app.models";

type InputType = "firstName" | "email" | "password" | "text";

interface InputComponentProps {
  type: InputType;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void; // New prop
  authType: AuthType;
  required?: boolean;
  placeholder?: string;
  reset: boolean;
}

const regexMap: Record<InputType, RegExp> = {
  firstName: /^[A-Za-z\s'-]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/,
  text: /./
};

export default function InputComponent({
  type,
  onChange,
  onValidationChange,
  authType,
  reset,
  placeholder,
  required = true
}: InputComponentProps) {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(false); // Start as false
  const [showPassword, setShowPassword] = useState(false);

  const placeholderMap: Record<InputType, string> = {
    firstName: "First Name",
    email: "Email",
    password: authType === "signUp" ? "Password (9chars + special char)" : "Password",
    text: placeholder ?? "type here"
  };

  useEffect(() => {
    if (!reset) return;
    setValue("");
    setIsValid(false);
    onValidationChange?.(false);
  }, [reset, onValidationChange])

  const validateInput = (inputValue: string) => {
    const valid = regexMap[type].test(inputValue) && inputValue.length > 0;
    setIsValid(valid);
    onValidationChange?.(valid);
    return valid;
  };

  const handleBlur = () => {
    validateInput(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    onChange(val);

    // Validate on change for immediate feedback
    validateInput(val);
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
        style={{ borderColor: !isValid && value.length > 0 ? "#FE7A33" : "" }}
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