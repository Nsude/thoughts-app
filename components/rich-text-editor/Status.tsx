"use client";

import { useCallback, useEffect } from "react";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";
import LoadingIcon from "@/public/icons/LoadingIcon";
import { debounce } from "lodash";

export default function SlateStatusDisplay () {
  const {slateStatus, setSlateStatus} = useSlateStatusContext();

  const debounceResetStatus = useCallback(() => {
    return debounce(() => {
      if (slateStatus === "unsaved_change") return;
      setSlateStatus("idle");
    }, 2000)
  }, [slateStatus]);

  useEffect(() => {
    debounceResetStatus();
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