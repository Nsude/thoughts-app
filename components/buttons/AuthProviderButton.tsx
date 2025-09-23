"use client";

import "@/components/buttons/buttons.css";
import { ButtonStatus } from "../app.models";
import LoadingIcon from "@/public/icons/LoadingIcon";

interface Props {
  label?: string;
  icon?: React.ReactNode;
  id: string;
  targetId: string;
  status: ButtonStatus;
  disabled?: boolean;
  handleClick: () => void;
}

export default function AuthProviderButton({
  label, icon, id, status, targetId, 
  disabled, handleClick}: Props) {
    const isLoading = id === targetId && status === "loading";

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={`my-authProviderButton relative
        flex items-center justify-center gap-x-[0.25rem] border border-myGray 
        ${label ? 'pl-[0.75rem] pr-[0.94rem]' : 'pl-1 aspect-square'}
        ${!icon ? 'w-full h-[2.5635rem]' : ''}
        h-[2.5rem] rounded-[0.375rem] bg-myWhite cursor-pointer`}>
      {/* status === "loading" */}
      <span
        style={{ opacity: isLoading ? 1 : 0 }}
        className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 pointer-events-none">
        <LoadingIcon />
      </span>

      <span
        style={{opacity: isLoading ? 0 : 1}}
        >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  )
}