"use client";

import { useCallback, useEffect } from "react";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";
import LoadingIcon from "@/public/icons/LoadingIcon";
import { debounce } from "lodash";

export default function SlateStatusDisplay () {
  const {status, setStatus} = useSlateStatusContext();

  const debounceResetStatus = useCallback(() => {
    return debounce(() => {
      setStatus("idle");
    }, 2000)
  }, [status])();

  useEffect(() => {
    debounceResetStatus();
  }, [status])

  if (status === "idle") return null;

  return (
    <div className="text-dark-gray-label flex items-center gap-x-1 mr-2">
      <span style={{
        opacity: status === "saved" ? 0 : 1
      }}> <LoadingIcon /> </span>
      <span style={{
        color: status === "saved" ? "var(--black)" : ""
      }}>{status || "Idle"}</span>
    </div>
  )
}