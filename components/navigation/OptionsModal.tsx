"use client";

import { Id } from "@/convex/_generated/dataModel";
import DeleteIcon from "@/public/icons/DeleteIcon";
import EditIcon from "@/public/icons/EditIcon";
import ShareIcon from "@/public/icons/ShareIcon";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { easeInOutCubic } from "../buttons/TabButton";

type OptionItem = {
  label: string;
  icon: any;
  handleClick: (thoughtId: Id<"thoughts">) => void;
}


interface OptionsModalProps {
  thoughtId: Id<"thoughts">;
  display: boolean;
  y: number;
}

export default function OptionsModal({ 
  thoughtId, y, display }: OptionsModalProps
) {
  const mainRef = useRef(null);
  const firstCall = useRef(true);

  useGSAP(() => {
    const main = mainRef.current;

    if (display) {
      gsap.set(main, { opacity: 1, pointerEvents: "all"})

      // make the modal animate from a 20px offset
      if (firstCall.current) {
        gsap.set(main, {top: y + 20 + "px"});
      }


      gsap.to(main, {
        top: y + "px",
        duration: .25,
        ease: easeInOutCubic 
      })

      firstCall.current = false;
    } else {
      gsap.set(main, {opacity: 0, pointerEvents: "none"});
      firstCall.current = true;
    }


  }, {scope: mainRef, dependencies: [y, display]})

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
      ref={mainRef}
      className="
        absolute top-0 right-0 w-[9.375rem] p-[0.75rem] bg-myWhite border border-myGray z-10 translate-x-[60%] opacity-0 pointer-events-none
        rounded-[15px] flex flex-col">
      {
        optionsItems.map(({ label, icon: Icon, handleClick }, i) => (
          <span key={`options_${i}`}>
          <button
              data-index={i + 1}
              className="my-optionsModalBtn
              w-full py-[0.375rem] px-1 flex gap-x-1 items-center h-[2.25rem] rounded-[6px]
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