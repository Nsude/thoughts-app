"use client";

import CheckmarkIcon from "@/public/icons/CheckmarkIcon";
import { ThoughtType } from "../app.models";

interface Props {
  label: string;
  description: string;
  id: ThoughtType;
  selectedAccess: ThoughtType;
  icon: React.ReactNode;
  handleClick: () => void;
}

export default function AccessButton(
  {label, description, handleClick, icon, id, selectedAccess}
  : Props) {
  return (
    <button 
      onClick={handleClick}
      className="flex w-full items-center justify-between
        py-[0.75rem] text-left">
      <div className="flex gap-x-[0.75rem] items-center">
        {icon}
        <div className="flex flex-col gap-y-0.5">
          <span className="">{label}</span>
          <span className="text-dark-gray-label text-label-14">
            {description}
          </span>
        </div>
      </div>

      {
        selectedAccess === id ? 
        <CheckmarkIcon /> : null
      }
    </button>
  )
}