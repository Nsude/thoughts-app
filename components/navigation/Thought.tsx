"use client";

import DefaultIcon from "@/public/icons/DefaultIcon";
import FreshThoughtIcon from "@/public/icons/FreshThoughtIcon";
import ThreeDotIcon from "@/public/icons/ThreeDotsIcon";
import { ActionDispatch, useCallback, useEffect, useMemo, useState } from "react";
import { ThoughtId, type Thought } from "../app.models";
import { ModalActions } from "./Navigation";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Props {
  handleClick: () => void;
  handleEditClick: (e: React.MouseEvent) => void;
  editing: boolean;
  thought: Thought;
  modalDispath: ActionDispatch<[action: ModalActions]>
}

export default function Thought({ 
  handleClick, handleEditClick,
  editing, modalDispath,
  thought: {_id, _creationTime, description} }: Props) {
  
  const fresh = _creationTime > (Date.now() - 300000);
  const [title, setTitle] = useState(description || "Untitled Thought");
  const router = useRouter();

  // mutation
  const renameThought = useMutation(api.thoughts.renameThought);

  useEffect(() => {
      if (description) return;
      setTitle("Untitled Thought")
  }, [router])

  const debounceUpdateTitle = useMemo(() => {
    return async () => {
      modalDispath({ type: "SET_EDITING", thoughtId: "" as ThoughtId });
      try {
        await renameThought({thoughtId: _id, newTitle: title})
      } catch (error) {
        console.log("Error renaming thought: ", error);
      }
    }
  }, [title])

  return (
    <div className="snap-start">
      <button
        onClick={handleClick}
        data-fresh={fresh}
        className="my-thoughtItem relative flex gap-x-1.5 items-center justify-between h-[2.5rem] w-full rounded-[0.375rem] px-2.5 overflow-clip">
        {
          fresh &&
          <span>
            <FreshThoughtIcon />
          </span>
        }

        <input 
          value={title} 
          readOnly={!editing}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={(e) => {
            const {key} = e;
            if (key.toLowerCase() !== "enter") return;
            debounceUpdateTitle();
          }}
          onBlur={() => debounceUpdateTitle()}
          style={{pointerEvents: editing ? "all" : "none"}}
          className="
            focus:outline-none
            z-[1] w-[90%] leading-[2] text-left truncate text-ellipsis
            " />

        {
          !fresh &&
          <span 
            role="button" 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {e.stopPropagation(); handleEditClick(e)}} >
            <ThreeDotIcon />
          </span>
        }
        <span role="button">
        </span>
      </button>
    </div>
  )
}