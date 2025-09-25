"use client";

import FreshThoughtIcon from "@/public/icons/FreshThoughtIcon";
import ThreeDotIcon from "@/public/icons/ThreeDotsIcon";
import { ActionDispatch, useEffect, useRef, useState } from "react";
import { ThoughtId, type Thought } from "../app.models";
import { ModalActions } from "./Navigation";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useShareThoughtContext } from "../contexts/ShareThoughtContext";

interface Props {
  handleClick: () => void;
  handleEditClick: (e: React.MouseEvent) => void;
  editing: boolean;
  thought: Thought;
  modalDispath: ActionDispatch<[action: ModalActions]>
  optionsCurrentThoughtId: ThoughtId;
}

export default function Thought({
  handleClick, handleEditClick,
  editing, modalDispath, optionsCurrentThoughtId,
  thought: { _id, _creationTime, description } }: Props) {

  const fresh = _creationTime > (Date.now() - 300000);
  const [title, setTitle] = useState(description || "Untitled Thought");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // mutation
  const renameThought = useMutation(api.thoughts.renameThought);
  const {state: {display}} = useShareThoughtContext();

  // clear previous title !IMPORTANT
  useEffect(() => {
    if (description) return;
    setTitle("Untitled Thought")
  }, [router, _id, description])

  // highlight title to rename 
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }

    button.classList.toggle("is-renaming", editing);
  }, [editing]);

  useEffect(() => {
    if (display) {
      const button = document.querySelector(`[data-id="${optionsCurrentThoughtId}"]`);
      if (!button) return;

      hightlightSelectedThought(button as HTMLButtonElement);
    }

  }, [optionsCurrentThoughtId, display])

  // highlight selected thought on refresh
  useEffect(() => {
    if (_id === "new") return;
    const thoughtId = localStorage.getItem("selectedThoughtId");
    if (!thoughtId) return;

    const button = document.querySelector(`[data-id="${thoughtId}"]`);
    if (!button) return;

    if (!button.classList.contains("is-selected"))
      button.classList.add("is-selected");
  }, [_id]);

  const handleClick_Local = (e: React.MouseEvent) => {
    handleClick();

    const { currentTarget } = e;
    const target = currentTarget as HTMLButtonElement;

    hightlightSelectedThought(target);
  }

  const hightlightSelectedThought = (target: HTMLButtonElement) => {
    const prevSelectedItem = document.querySelector(".my-thoughtItem.is-selected");
    if (prevSelectedItem) prevSelectedItem.classList.remove("is-selected");

    if (!target.classList.contains("is-selected")) {
      target.classList.add("is-selected");
    }

    // set selected thought Id to local storage
    const thoughtId = target.getAttribute("data-id");
    if (!thoughtId) return;

    localStorage.setItem("selectedThoughtId", thoughtId);
  }

  // update title 
  const updateTitle = async () => {
    modalDispath({ type: "SET_EDITING", thoughtId: "" as ThoughtId });
    try {
      await renameThought({ thoughtId: _id, newTitle: title })
    } catch (error) {
      console.log("Error renaming thought: ", error);
    }
  }

  return (
    <div className="snap-start">
      <button
        ref={buttonRef}
        onClick={handleClick_Local}
        data-id={_id}
        className="my-thoughtItem relative flex gap-x-1.5 items-center justify-between 
        h-[2.5rem] w-full rounded-[0.375rem] px-2.5 overflow-clip">
        <div className="flex items-center gap-x-1.5 w-[90%]">
          {
            fresh &&
            <span>
              <FreshThoughtIcon />
            </span>
          }

          {
            editing ?
              <input
                ref={inputRef}
                value={title}
                readOnly={!editing}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setTitle(e.currentTarget.value)}
                onKeyDown={(e) => {
                  const { key } = e;
                  if (key.toLowerCase() !== "enter") return;
                  updateTitle();
                }}
                onBlur={() => updateTitle()}
                style={{ pointerEvents: editing ? "all" : "none" }}
                className="
                focus:outline-none
                z-[1] leading-[2] text-left truncate text-ellipsis
                " />
              :
              <span className="truncate leading-[2]">{title}</span>
          }
        </div>

        <span
          role="button"
          style={{
            opacity: editing ? 0 : 1,
            pointerEvents: editing ? "none" : "all",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); handleEditClick(e) }}>
          <ThreeDotIcon />
        </span>
      </button>
    </div>
  )
}