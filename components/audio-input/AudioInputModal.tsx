"use client";

import UploadIcon from "@/public/icons/UploadIcon";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { easeInOutCubic } from "../buttons/TabButton";
import PauseIcon from "@/public/icons/PauseIcon";
import PlayIcon from "@/public/icons/PlayIcon";

interface Props {
  display: boolean;
  startRecording: boolean;
  audioUrl?: string | null; 
  UploadAudio: () => void;
}

export default function AudioInputModal({display, startRecording, audioUrl, UploadAudio}: Props) {
  const mainRef = useRef(null);
  const [audioTime, setAudioTime] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playbackDuration = useRef(0);
  
  const timerRef = useRef<NodeJS.Timeout>(null);

  const disableControl = !(!!audioUrl); // disable control btns if audio url isn't available

  const decodeAudio = async (url: string) => {
    if (!url) return
    const blob = await fetch(url).then(res => res.blob());
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext();
    const decodedAudio = audioCtx.decodeAudioData(arrayBuffer);

    return decodedAudio;
  }

  // create audio element when audio url is available
  const createAudioElem = async () => {
    if (!audioUrl) return;

    const currentAudioElem = new Audio(audioUrl);
    audioRef.current = currentAudioElem;

    const decodedAudioObject = await decodeAudio(audioUrl);
    if (!decodedAudioObject) return;
    playbackDuration.current = decodedAudioObject.duration;

    currentAudioElem.onplay = () => {
      setIsPlaying(true);
    }

    currentAudioElem.onpause = () => {
      setIsPlaying(false);
    }

    currentAudioElem.ontimeupdate = () => {
      let currentTime = currentAudioElem.currentTime.toFixed(0);
      setAudioTime(+currentTime);
    }
  }

  useEffect(() => {
    if (!audioUrl) return;

    createAudioElem();

  }, [audioUrl])

  // handle playback
  const handlePlayback = () => {
    if (!audioRef.current) return;

    // already playing
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play();
    }
  }


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
      setAudioTime(prev => prev + 1);
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setAudioTime(0);
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
      }).then(() => setAudioTime(0))
    }

  }, {dependencies: [display], scope: mainRef})

  return (
    <div 
      onMouseDown={(e) => e.stopPropagation()}
      ref={mainRef} className="absolute scale-0 top-[0%] -translate-x-[20%] h-[3rem] w-fit flex 
    items-center py-0.5 gap-x-[0.25rem]">
      {/* Recording Indicator */}
      <div className="
        relative w-[11.125rem] h-full bg-myWhite rounded-full border-tab-gray border-3
        flex items-center px-[0.75rem] text-label-small">
        
        {/* Recording time & control button */}
        <div 
          className="absolute flex items-center gap-x-0.5">
          <button 
            disabled={disableControl}
            onClick={handlePlayback}
            className="my-audioControlBtn flex items-center justify-center w-[1.5rem] aspect-square">
            { isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span>{formatTime(audioTime)}</span>
        </div>

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