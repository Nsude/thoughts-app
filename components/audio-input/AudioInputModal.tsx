"use client";

import UploadIcon from "@/public/icons/UploadIcon";
import { useEffect, useRef, useState } from "react";
import { AudioComponentAction, AudioComponentState } from "../app.models";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { easeInOutCubic } from "../buttons/TabButton";

interface Props {
  display: boolean;
  startRecording: boolean;
  UploadAudio: () => void;
}

export default function AudioInputModal({display, startRecording, UploadAudio}: Props) {
  const [recordingTime, setRecordingTime] = useState(0); 
  const timerRef = useRef<NodeJS.Timeout>(null);
  const mainRef = useRef(null);

  // call start and stop recording functions
  useEffect(() => {
    if (display && startRecording) {
      startTimer();
    } else if (!startRecording || !display) {
      stopTimer();
    }

  }, [display, startRecording])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setRecordingTime(0);
    }
  }


  // display and hide modal
  useGSAP(() => {
    const con = mainRef.current;
    if (!con) return;

    if (display) {
      gsap.to(con, {
        top: "-120%",
        scale: 1,
        duration: .4,
        ease: easeInOutCubic
      })
    } else {
      gsap.to(con, {
        top: "0%",
        scale: 0,
        duration: .4,
        ease: easeInOutCubic
      })
    }

  }, {dependencies: [display], scope: mainRef})

  return (
    <div ref={mainRef} className="absolute scale-0 top-[0%] -translate-x-[20%] h-[3rem] w-fit flex 
    items-center py-0.5 gap-x-[0.25rem]">
      {/* Recording Indicator */}
      <div className="
        relative w-[11.125rem] h-full bg-myWhite rounded-full border-tab-gray border-3
        flex items-center px-[0.75rem] text-label-small">
        <div className="absolute">{formatTime(recordingTime)}</div>
        {/* Audio Visualizer */}
        <div></div>
      </div>

      {/* Send Button */}
      <button 
        onClick={UploadAudio}
        className="h-[2.25rem] pl-0.5 aspect-square bg-myWhite border-tab-gray border-3 
        flex items-center justify-between rounded-full">
        <UploadIcon />
      </button>
    </div>
  )
}