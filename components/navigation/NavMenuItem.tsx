"use client";
interface Props {
  icon: React.ReactNode;
  label: string;
  handleClick: () => void;
  hideWord: boolean;
}

export default function NavMenuItem({icon, label, handleClick, hideWord}: Props) {
  return (
    <button 
      onClick={handleClick}
      data-hideword={hideWord}
      className="my-navMenuItem text-nowrap min-w-fit relative flex gap-x-1.5 items-center 
      h-[2.5rem] w-full rounded-[0.375rem] px-2.5 overflow-clip">
      <span>{icon}</span>
      <span style={{opacity: hideWord ? 0 : 1, position: hideWord ? "absolute" : "unset"}}>{label}</span>
    </button>
  )
}