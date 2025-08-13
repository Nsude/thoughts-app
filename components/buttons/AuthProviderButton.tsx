"use client";

import "@/components/buttons/buttons.css";

interface Props {
  label?: string;
  icon?: React.ReactNode;
  handleClick: () => void;
}

export default function AuthProviderButton({label, icon, handleClick}: Props) {
  return (
    <button
      onClick={handleClick}
      className={`my-authProviderButton
        flex items-center justify-center gap-x-[0.25rem] border border-myGray 
        ${label ? 'pl-[0.75rem] pr-[0.94rem]' : 'pl-1 aspect-square'}
        ${!icon ? 'w-full h-[2.5635rem]' : ''}
        h-[2.5rem] rounded-[0.375rem] bg-myWhite cursor-pointer`}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}