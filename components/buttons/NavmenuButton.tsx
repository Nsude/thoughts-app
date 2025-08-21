"use client";

import "@/components/buttons/buttons.css";
import DefaultIcon from "@/public/icons/DefaultIcon";

interface Props {
  text?: string;
  icon?: React.ReactNode;
  reverseRow?: boolean;
  handleClick: () => void;
}

export default function NavMenuButton({ text, icon, reverseRow, handleClick }: Props) {

  return (
    <button
    onClick={handleClick}
    className={` my-navMenuButton
    flex items-center justify-center gap-x-[0.25rem]
    ${text && !reverseRow ? 'pl-[0.3rem] pr-[0.5rem]' : ''}
    ${!text ? 'pl-1 aspect-square' : ''}
    ${reverseRow ? 'flex-row-reverse pr-[0.3rem] pl-[0.5rem]' : ''}
    h-[1.875rem] rounded-[30px] bg-dark-gray text-white text-[14px] cursor-pointer`}>
      <span>{icon || <DefaultIcon />}</span>
      <span>{text}</span>
    </button>
  )
}