"use client";

import { Id } from "@/convex/_generated/dataModel";
import DeleteIcon from "@/public/icons/DeleteIcon";
import EditIcon from "@/public/icons/EditIcon";
import ShareIcon from "@/public/icons/ShareIcon";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ActionDispatch, useMemo, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ModalActions } from "./Navigation";
import { useRouter } from "next/navigation";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";
import { useConfirmation } from "../contexts/ConfirmationContext";
import { useToastContext } from "../contexts/ToastContext";
import { useShareThoughtContext } from "../contexts/ShareThoughtContext";
import { ThoughtId } from "../app.models";

type OptionItem = {
  label: string;
  icon: any;
  handleClick: (thoughtId: Id<"thoughts">) => void;
}

interface OptionsModalProps {
  thoughtId: Id<"thoughts">;
  display: boolean;
  y: number;
  modalDispath: ActionDispatch<[action: ModalActions]>
}

export default function OptionsModal({
  thoughtId, y, display, modalDispath }: OptionsModalProps
) {
  const { confirmAction } = useConfirmation();
  const { setCurrentContent } = useSlateStatusContext();
  const { setToast } = useToastContext();
  const deleteThought = useMutation(api.thoughts.deleleThought);

  const mainRef = useRef(null);
  const firstCall = useRef(true);
  const router = useRouter();

  const {shareThoughtActions} = useShareThoughtContext();

  useGSAP(() => {
    const main = mainRef.current;

    if (display) {
      gsap.set(main, { opacity: 1, pointerEvents: "all" })

      // make the modal animate from a 20px offset
      if (firstCall.current) {
        gsap.set(main, { top: y + 20 + "px" });
      }

      gsap.to(main, {
        top: y + "px",
        duration: .25,
      })

      firstCall.current = false;
    } else {
      gsap.set(main, { opacity: 0, pointerEvents: "none" });
      firstCall.current = true;
    }

  }, { scope: mainRef, dependencies: [y, display] })

  const handleShare = (selectedThoughtId: ThoughtId) => {
    if (thoughtId !== selectedThoughtId) {
      router.replace(`/thoughts/${selectedThoughtId}`);
    }
    
    shareThoughtActions.toggleDisplay(true);
  };

  const handleRename = (thoughtId: ThoughtId) => {
    modalDispath({ type: "SET_EDITING", thoughtId })
    modalDispath({ type: "TOGGLE_DISPLAY", value: false })
  };

  const handleDelete = async (thoughtId: ThoughtId) => {
    modalDispath({ type: "TOGGLE_DISPLAY", value: false });
    const confirmDelete = await confirmAction();
    if (!confirmDelete) return

    try {
      const displayedThoughtId = location.href.split("/thoughts/")[1];
      const isDisplayed = displayedThoughtId === thoughtId;
      await deleteThought({ thoughtId });
      modalDispath({ type: "TOGGLE_DISPLAY", value: false })
      setToast({
        title: "Delete Successful",
        isError: false,
        showToast: true
      })

      // navigate to new thought
      setCurrentContent([]) // reset current content
      if (isDisplayed) router.replace("/thoughts/new");

    } catch (error) {
      console.error("Error deleting thought: ", error);
    }
  };

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
      onMouseDown={(e) => e.stopPropagation()}
      ref={mainRef}
      className="
        absolute top-0 right-0 w-[9.375rem] p-[0.75rem] bg-myWhite border border-myGray z-10 translate-x-[60%] opacity-0 pointer-events-none
        rounded-[15px] flex flex-col">
      {
        optionsItems.map(({ label, icon: Icon, handleClick }, i) => (
          <span key={`options_${i}`}>
            <button
              data-index={i + 1}
              className={`my-optionsModalBtn
              w-full py-[0.375rem] px-1 flex gap-x-1 items-center h-[2.25rem] rounded-[6px]
            `}
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