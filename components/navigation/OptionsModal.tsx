import { Id } from "@/convex/_generated/dataModel";
import DeleteIcon from "@/public/icons/DeleteIcon";
import EditIcon from "@/public/icons/EditIcon";
import ShareIcon from "@/public/icons/ShareIcon";
import { useCallback, useEffect, useMemo } from "react";

type OptionItem = {
  label: string;
  icon: any;
  handleClick: (thoughtId: Id<"thoughts">) => void;
}


export interface OptionsModalProps {
  thoughtId: Id<"thoughts">;
  display: boolean;
  x: number;
  y: number;
}

export default function OptionsModal({ thoughtId, x, y, display }: OptionsModalProps) {

  const handleShare = useCallback((thoughtId: Id<"thoughts">) => {
    console.log("share clicked")
  }, [])

  const handleRename = useCallback((thoughtId: Id<"thoughts">) => {
    console.log("rename clicked")
  }, [])

  const handleDelete = useCallback((thoughtId: Id<"thoughts">) => {
    console.log("delete clicked")
  }, [])

  const optionsItems: OptionItem[] = useMemo(() => [
    {
      label: "Share",
      icon: ShareIcon,
      handleClick: handleShare
    },
    {
      label: "Rename",
      icon: EditIcon,
      handleClick: handleRename
    },
    {
      label: "Delete",
      icon: DeleteIcon,
      handleClick: handleDelete
    },
  ], [])

  return (
    <div
      className="
        absolute top-0 right-0 w-[9.375rem] p-[0.75rem] bg-myWhite border border-myGray z-10 translate-x-[60%]
        rounded-[15px] flex flex-col">
      {
        optionsItems.map(({ label, icon: Icon, handleClick }, i) => (
          <span key={`options_${i}`}>
          <button
            className="
              w-full py-[0.375rem] px-1 flex gap-x-1 items-center h-[2.25rem]
            "
            onClick={() => handleClick(thoughtId)}>
            <Icon />
            <span>{label}</span>
          </button>
          {
            i === (optionsItems.length - 2) && 
            <span key={`line_at_${i}`} className="block my-[0.75rem] bg-border-gray h-[1px] w-full" />
          }
          </span>
        ))
      }
    </div>
  )
}