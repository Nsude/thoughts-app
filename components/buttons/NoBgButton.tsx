"use client";

import "@/components/buttons/buttons.css";
import DefaultIcon from "@/public/icons/DefaultIcon";

interface Props {
  icon?: React.ReactNode;
  handleClick?: () => void;
}

export default function NoBgButton({ icon, handleClick }: Props) {

  return (
    <button
      onClick={handleClick}
    className={`h-[2.25rem] aspect-square my-noBgButton flex justify-center items-center rounded-[0.38rem]`}>
      <span>{icon || <DefaultIcon />}</span>
    </button>
  )
}