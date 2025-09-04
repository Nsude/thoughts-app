"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ThoughtId, User, Version } from "../app.models";
import VersionItem from "./VersionItem";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { easeInOutCubic } from "../buttons/TabButton";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";

interface Props {
  thoughtId: ThoughtId
}

export default function Versions() {
  // thought id
  const params = useParams();
  const thoughtId = params.thoughtId as ThoughtId

  const [selected, setSelected] = useState<Id<"versions">>("" as Id<"versions">);
  const spanRef = useRef(null);
  const mainRef = useRef(null);
  const {slateStatus, setSlateStatus, currentContent} = useSlateStatusContext();
  
  // convex queries
  const thoughtVersions = useQuery(
    api.thoughts.getThoughtVersions, 
    thoughtId !== "new" ? {thoughtId} : "skip"
  );
  const selectedVersion = useQuery(
    api.thoughts.getSelectedVersion, 
    thoughtId !== "new" ? {thoughtId} : "skip"
  )

  // convex mutations
  const setConvexSelectedVersion = useMutation(api.thoughts.setSelectedVersion);
  const updateThought = useMutation(api.thoughts.updateThought);

  // enable manual save chanages functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const {key} = e;
      console.log(key)
      if (e.ctrlKey && key.toLowerCase() === "s") {
        e.preventDefault();
        saveChanges();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
  }, [])

  // set clicked the item to convex selected version
  const handleConvexSelectedVersion = async (versionId: Id<"versions">) => {
    setSlateStatus("loading");
    try {
      await setConvexSelectedVersion({
        thoughtId,
        selectedVersion: versionId
      })
      setSlateStatus("idle")
    } catch (error) {
      console.error(error)
    }
  }

  // save changes before switching to other versions
  const saveChanges = async () => {
    if (!currentContent) return;
    try {
      setSlateStatus("saving")
      await updateThought({thoughtId, newContent: currentContent});
      setSlateStatus("saved");
    } catch (error) {
      console.error(error);
    }
  }

  const onVersionClick = async (e: React.MouseEvent, id: Id<"versions">, isCore: boolean) => {
    if (slateStatus !== "idle" && slateStatus !== "saved") return;
    setSelected(id); 
    animateIndicator(e, isCore);
    // save content
    await saveChanges();
    // update convex selected version
    await handleConvexSelectedVersion(id);
  }

  // moves the indicator
  const animateIndicator = (e: React.MouseEvent, isCore: boolean) => {
    const target = e.target as HTMLElement;
    const main = mainRef.current ? mainRef.current as HTMLSpanElement : null;
    const indicator = spanRef.current;

    if (!main || !indicator) return;

    const { top: targetTop } = target.getBoundingClientRect();
    const { top: mainTop } = main.getBoundingClientRect();

    // move indicator
    const top = targetTop - mainTop;
    gsap.to(spanRef.current, {
      top: `${top - 4}px`,
      height: isCore ? "1.3rem" : "2.7rem",
      duration: .4,
      ease: easeInOutCubic
    })
  }

  if (!thoughtVersions) return null;

  return (
    <div ref={mainRef} className="relative pr-[2rem] flex items-center justify-between gap-x-3">
      {/* ==== Versions ==== */}
      <div className="flex flex-col gap-y-[0.9375rem] items-end h-fit">
        {
          thoughtVersions.map((version) => (
            <VersionItem 
              key={version._id}
              version={version}
              selectedVersion={selected}
              handleClick={(e) => onVersionClick(e, version._id, version.isCore)}
            />
          ))
        }
      </div>

      <div className="absolute top-0 right-0 w-[3px] h-full bg-border-gray rounded-3xls">
        <span ref={spanRef} style={{height: selectedVersion?.isCore ? "1.3rem" : "2.5rem"}}
          className="absolute top-0 bg-myBlack w-full block h-[2.5rem]" />
      </div>
    </div>
  )
}