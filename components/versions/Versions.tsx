"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ThoughtId, User, Version } from "../app.models";
import VersionItem from "./VersionItem";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const {slateStatus, setSlateStatus, currentContent, setVersionSwitched} = useSlateStatusContext();
  
  
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

  const hasInitialized = useRef(false);
  const lastSavedVersionLength = useRef(0);

  const getCoreVersion = () => {
    if (!thoughtVersions) return;

    const coreVersion = thoughtVersions.filter(version => version.isCore)[0];
    return coreVersion;
  }

  // it there's a change to the length of the thought versions (say an item has beeen deleted)
  // set the selected version to core
  useEffect(() => {
    if (!thoughtVersions) return;

    if (lastSavedVersionLength.current === thoughtVersions.length) return;
    
    // set to last selected version on initial load
    if (lastSavedVersionLength.current === 0 && selectedVersion?._id) {
      setSelected(selectedVersion._id);
      lastSavedVersionLength.current = thoughtVersions.length; 
      return;
    }
    
    if (lastSavedVersionLength.current < thoughtVersions.length) {
      // version added 
      const lastItem = thoughtVersions[thoughtVersions.length - 1];
      setSelected(lastItem._id);
      handleConvexSelectedVersion(lastItem._id);
    } else {
      // version deleted
      const coreVersion = getCoreVersion();
      if (!coreVersion) return;
      setSelected(coreVersion._id);
      handleConvexSelectedVersion(coreVersion._id);
    }
    
    lastSavedVersionLength.current = thoughtVersions.length;
  }, [thoughtVersions?.length])

  // sync selectedVersion._id with local state on thought switch
  useEffect(() => {
    if (selectedVersion?._id) {
      setSelected(selectedVersion._id);
      lastSavedVersionLength.current = thoughtVersions ? thoughtVersions.length : 0;
    }
  }, [selectedVersion?._id]);

  // Initialize selected state and animate indicator
  useEffect(() => {
    if (!selectedVersion || !thoughtVersions || hasInitialized.current) return;

    setSelected(selectedVersion._id);
    hasInitialized.current = false;

    // Animate to the selected version after a brief delay to ensure DOM is ready
    setTimeout(() => {
      const selectedElement = document.querySelector(`[data-version-id="${selectedVersion._id}"]`);
      if (selectedElement && spanRef.current && mainRef.current) {
        const target = selectedElement as HTMLElement;
        const main = mainRef.current as HTMLSpanElement;

        const { top: targetTop } = target.getBoundingClientRect();
        const { top: mainTop } = main.getBoundingClientRect();
        const top = targetTop - mainTop;

        gsap.to(spanRef.current, {
          top: `${top - 4}px`,
          height: selectedVersion.isCore ? "1.3rem" : "2.7rem",
          duration: .4,
          ease: easeInOutCubic
        });
      }
    }, 50);

  }, [selectedVersion, thoughtVersions]);

  // enable manual save chanages functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const {key} = e;

      if (e.ctrlKey && key.toLowerCase() === "s") {
        e.preventDefault();
        saveChanges();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
  }, [])

  // set clicked the item to convex selected version
  const handleConvexSelectedVersion = async (versionId: Id<"versions">) => {
    if (versionId === selectedVersion?._id) return;
     setSlateStatus("loading");
    try {
      await setConvexSelectedVersion({
        thoughtId,
        selectedVersion: versionId
      })
      setSlateStatus("idle");
    } catch (error) {
      console.error(error)
    }
  }

  // save changes before switching to other versions
  const saveChanges = async () => {
    if (!currentContent) return;
    if (slateStatus !== "unsaved_change") return;
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
    // save content
    await saveChanges();
    setVersionSwitched(true);
    setSelected(id); 
    animateIndicator(e, isCore);
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
              selectedVersion={selected || (selectedVersion?._id || selected)}
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