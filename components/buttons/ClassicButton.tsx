"use client";

import "@/components/buttons/buttons.css";
import DefaultIcon from "@/public/icons/DefaultIcon";

interface Props {
  text?: string;
  icon?: React.ReactNode;
  preselect?: boolean;
  handleClick?: () => void;
}

export default function ClassicButton({ text, icon, preselect, handleClick }: Props) {

  return (
    <button
    onClick={handleClick}
    style={{backgroundColor: preselect ? "var(--accent)" : ""}}
    className={` my-classicButton
    flex items-center justify-center gap-x-[0.25rem] border border-myGray 
    ${text ? 'pl-[0.75rem] pr-[0.94rem]' : 'pl-1 aspect-square'}
    h-[2.25rem] rounded-[30px] bg-myWhite cursor-pointer`}>
      <span>{icon || <DefaultIcon />}</span>
      <span>{text}</span>
    </button>
  )
}