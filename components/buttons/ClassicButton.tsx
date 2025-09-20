"use client";

import "@/components/buttons/buttons.css";
import DefaultIcon from "@/public/icons/DefaultIcon";
import { ButtonStatus } from "../app.models";
import LoadingIcon from "@/public/icons/LoadingIcon";

interface Props {
  text?: string;
  icon?: React.ReactNode;
  fitWidth?: boolean;
  noScaleOnFocus?: boolean;
  preselect?: boolean;
  handleClick?: () => void;
  status?: ButtonStatus;
  id?: string;
  selectedId?: string;
}

export default function ClassicButton(
  { text, icon, fitWidth, preselect, handleClick,
    noScaleOnFocus, status, id, selectedId
  }: Props) {
  const isLoading = id === selectedId && 
    (selectedId || id) !== undefined && status === "loading";

  return (
    <button
      onClick={handleClick}
      style={{ backgroundColor: preselect ? "var(--accent)" : "" }}
      className={`my-classicButton ${noScaleOnFocus ? 'no-scale' : ''}
    flex items-center justify-center gap-x-[0.25rem] border border-myGray 
    ${text ? 'pl-[0.75rem] pr-[0.94rem]' : 'pl-1 aspect-square'}
    ${fitWidth ? 'w-fit' : ''}
    h-[2.25rem] rounded-[30px] bg-myWhite cursor-pointer`}>
      {
        isLoading ?
        <span><LoadingIcon size={24} /></span>
        :
        <span>{icon || <DefaultIcon />}</span>
      }
      <span>{text}</span>
    </button>
  )
}