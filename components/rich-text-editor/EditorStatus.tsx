"use client";

import { useEffect, useRef } from "react";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";
import LoadingIcon from "@/public/icons/LoadingIcon";

export default function SlateStatusDisplay () {
  const {slateStatus, setSlateStatus} = useSlateStatusContext();

  const timeout = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      setSlateStatus("idle")
    }, 2000)

  }, [slateStatus])

  if (slateStatus === "idle") return null;

  return (
    <div className="text-dark-gray-label flex items-center gap-x-1 mr-2">
      <span style={{
        opacity: slateStatus === "saved" || slateStatus === "unsaved_change" ? 0 : 1
      }}> <LoadingIcon /> </span>
      <span style={{
        color: slateStatus === "saved" ? "var(--black)" : 
        slateStatus === "unsaved_change" ? "var(--accent)" : ""
      }}>{slateStatus.split("_").join(" ") || "Idle"}</span>
    </div>
  )
}