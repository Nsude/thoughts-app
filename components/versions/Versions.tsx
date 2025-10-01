"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ThoughtId } from "../app.models";
import VersionItem from "./VersionItem";
import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { easeInOutCubic } from "../buttons/TabButton";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";
import { useNavigationContext } from "../contexts/NavigationContext";
import { useGSAP } from "@gsap/react";
import FourDotsIcon from "@/public/icons/FourDotsIcon";
import CloseIcon from "@/public/icons/CloseIcon";

export default function Versions() {
  // thought id
  const params = useParams();
  const thoughtId = params.thoughtId as ThoughtId

  const [selected, setSelected] = useState<Id<"versions">>("" as Id<"versions">);
  const spanRef = useRef(null);
  const mainRef = useRef(null);
  const { slateStatus, setSlateStatus, currentContent, setVersionSwitched } = useSlateStatusContext();

  // convex queries
  const thoughtVersions = useQuery(
    api.thoughts.getThoughtVersions,
    thoughtId !== "new" ? { thoughtId } : "skip"
  );
  const selectedVersion = useQuery(
    api.thoughts.getSelectedVersion,
    thoughtId !== "new" ? { thoughtId } : "skip"
  )

  // navigation context 
  const { showNavigation } = useNavigationContext();

  // convex mutations
  const setConvexSelectedVersion = useMutation(api.thoughts.setSelectedVersion);
  const updateThought = useMutation(api.thoughts.updateThought);

  const hasInitialized = useRef(false);
  const lastSavedVersionLength = useRef(0);

  const getCoreVersion = useCallback(() => {
    if (!thoughtVersions) return;

    const coreVersion = thoughtVersions.filter(version => version.isCore)[0];
    return coreVersion;
  }, [thoughtVersions]);


  // set clicked the item to convex selected version
  const handleConvexSelectedVersion = useCallback(
    async (versionId: Id<"versions">) => {
      if (versionId === selectedVersion?._id) return;
      setSlateStatus("loading");

      try {
        await setConvexSelectedVersion({
          thoughtId,
          selectedVersion: versionId,
        });
        setSlateStatus("idle");
      } catch (error) {
        console.error(error);
      }
    },
    [selectedVersion?._id, setConvexSelectedVersion, thoughtId, setSlateStatus]
  );

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
  }, [thoughtVersions?.length, getCoreVersion, selectedVersion?._id, thoughtVersions, handleConvexSelectedVersion])

  // sync selectedVersion._id with local state on thought switch
  useEffect(() => {
    if (selectedVersion?._id) {
      setSelected(selectedVersion._id);
      lastSavedVersionLength.current = thoughtVersions ? thoughtVersions.length : 0;
    }
  }, [selectedVersion?._id, thoughtVersions]);

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

  // save changes before switching to other versions
  const saveChanges = useCallback(async () => {
    if (!currentContent) return;
    if (slateStatus !== "unsaved_change") return;
    try {
      setSlateStatus("saving")
      await updateThought({ thoughtId, newContent: currentContent });
      setSlateStatus("saved");
    } catch (error) {
      console.error(error);
    }
  }, [currentContent, slateStatus, setSlateStatus, thoughtId, updateThought])

  // enable manual save chanages functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;

      if (e.ctrlKey && key.toLowerCase() === "s") {
        e.preventDefault();
        saveChanges();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
  }, [saveChanges])


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

  useGSAP(() => {
    if (!mainRef.current) return;
    gsap.to(mainRef.current, {
      opacity: showNavigation ? 0 : 1,
      pointerEvents: showNavigation ? "none" : "all",
      duration: .2
    })

  }, { dependencies: [showNavigation, mainRef] })

  const mobileBtn = useRef(null);
  const toggleDisplayVersions = (display: boolean) => {
    if (!mainRef.current) return;
    const container = mainRef.current as HTMLDivElement;
    const children = container.children;
    const duration = .25;

    gsap.to(container, { 
      background: display ? "#2c2c2c" : "transparent", 
      pointerEvents: display ? "all" : "none" ,
      duration
    });

    gsap.to(children, {
      opacity: display ? 1 : 0,
      duration
    })

    gsap.to(mobileBtn.current, {
      opacity: display ? 0 : 1,
      pointerEvents: display ? "none" : "all",
      duration: display ? .25 : .4
    })
  }

  // remove all gsap styles when a user switches sizes and ensure the mobile button is visible
  useEffect(() => {
    const hanldeResize = () => {
      if (window.innerWidth < 1020) return;
      if (!mainRef.current) return;
      const container = mainRef.current as HTMLDivElement;
      const children = container.children;

      gsap.set(container, {clearProps: true});
      gsap.set(children, {clearProps: true});
      gsap.set(mobileBtn.current, {opacity: 1, pointerEvents: "all"});
    }

    window.addEventListener("resize", hanldeResize);
  }, [mainRef, mobileBtn])

  if (!thoughtVersions) return null;

  return (
    <div className="relative">
      {/* for mobile */}
      <button 
        ref={mobileBtn}
        onTouchStart={() => toggleDisplayVersions(true)}
        className="absolute lg:hidden flex justify-center items-center top-0 right-0 z-1 w-[2.25rem] aspect-square 
        border-[1.5px] border-border-gray rounded-[10px] bg-dark-gray overflow-clip">
        <FourDotsIcon color="#fff" />
      </button>

      <div ref={mainRef} className="relative pr-[2rem] bg-transparent flex items-start 
        lg:items-center justify-between gap-x-3 p-[0.75rem] lg:p-[unset] lg:pr-[2rem] 
        rounded-[10px] lg:rounded-none overflow-clip pointer-events-none lg:pointer-events-auto">
        
        {/* for mobile */}
        <button 
          onTouchStart={() => toggleDisplayVersions(false)}
          className="opacity-0 lg:hidden flex justify-center items-center">
          <CloseIcon size={24} />
        </button>

        {/* ==== Versions ==== */}
        <div className="opacity-0 lg:opacity-100 flex flex-col gap-y-[0.9375rem] items-end h-fit">
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

        <div className="opacity-0 lg:opacity-100 absolute top-0 right-0 w-[3px] h-full bg-border-gray rounded-3xls">
          <span ref={spanRef} style={{ height: selectedVersion?.isCore ? "1.3rem" : "2.5rem" }}
            className="absolute top-0 bg-myBlack w-full block h-[2.5rem]" />
        </div>
      </div>
    </div>
  )
}