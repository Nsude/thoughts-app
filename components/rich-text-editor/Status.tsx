"use client";

import { useCallback, useEffect } from "react";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";
import LoadingIcon from "@/public/icons/LoadingIcon";
import { debounce } from "lodash";

export default function SlateStatusDisplay () {
  const {slateStatus, setSlateStatus} = useSlateStatusContext();

  const debounceResetStatus = useCallback(() => {
    return debounce(() => {
      setSlateStatus("idle");
    }, 2000)
  }, [slateStatus])();

  useEffect(() => {
    debounceResetStatus();
  }, [slateStatus])

  if (slateStatus === "idle") return null;

  return (
    <div className="text-dark-gray-label flex items-center gap-x-1 mr-2">
      <span style={{
        opacity: slateStatus === "saved" ? 0 : 1
      }}> <LoadingIcon /> </span>
      <span style={{
        color: slateStatus === "saved" ? "var(--black)" : ""
      }}>{slateStatus || "Idle"}</span>
    </div>
  )
}