"use client";

import "@/components/buttons/buttons.css";
import DefaultIcon from "@/public/icons/DefaultIcon";

interface Props {
  text?: string;
  icon?: React.ReactNode;
  handleClick?: () => void;
}

export default function GradientBorderButton({ text, icon, handleClick}: Props) {
  return (
    <button
      onClick={handleClick}
      className={`p-[2px] rounded-full animate-gradient bg-linear-(--button-gradient)`}>
      <span className={`inner-span flex justify-center rounded-full items-center gap-x-1 py-1 px-[0.75rem] bg-myWhite`}>
        <span>{icon || <DefaultIcon />}</span>
        <span>{text}</span>
      </span>
    </button>
  )
}