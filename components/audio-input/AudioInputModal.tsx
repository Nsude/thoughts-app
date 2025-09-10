"use client";

import UploadIcon from "@/public/icons/UploadIcon";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { easeInOutCubic } from "../buttons/TabButton";
import PauseIcon from "@/public/icons/PauseIcon";
import PlayIcon from "@/public/icons/PlayIcon";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer-react19";

interface Props {
  display: boolean;
  startRecording: boolean;
  handleExceedRecordLimit: () => void;
  uploadAudio: (audioBlob: Blob | null) => void;
}

export default function AudioInputModal({display, startRecording, uploadAudio, handleExceedRecordLimit}: Props) {
  const mainRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const limitReached = useRef(false);
  
  // voice visualizer
  const recorderControls = useVoiceVisualizer({
    onEndAudioPlayback() {
      setIsPlaying(false);
    },

  });
  const {
    startAudioPlayback,
    stopAudioPlayback,
    startRecording: _startRecording,
    stopRecording,
    recordedBlob,
    isRecordingInProgress,
    formattedRecordedAudioCurrentTime,
    formattedRecordingTime
  } = recorderControls;


  // handle playback
  const handlePlayback = () => {

    // already playing
    if (isPlaying) {
      stopAudioPlayback();
      setIsPlaying(false)
    } else {
      startAudioPlayback();
      setIsPlaying(true)
    }
  }

  // call start and stop recording functions
  useEffect(() => {
    if (display && startRecording) {
      _startRecording();
    } else if (!startRecording || !display) {
      stopRecording();
    }

  }, [display, startRecording])

  // stop the recording input when limit duration is reached
  useEffect(() => {
    if (!limitReached.current) return;
    handleExceedRecordLimit()

  }, [limitReached.current])

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
          className="
            absolute flex items-center gap-x-0.5 z-1 bg-myWhite/10 pl-1 pr-3 rounded-[6px]
            backdrop-blur-[25px]
            ">
          <button 
            disabled={!(!!recordedBlob)}
            onClick={handlePlayback}
            className="my-audioControlBtn flex items-center justify-center w-[1.5rem] aspect-square">
            { isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span>{
            isRecordingInProgress ? formattedRecordingTime : 
            formattedRecordedAudioCurrentTime
          }</span>
        </div>

        {/* Audio Visualizer */}
        <div className="absolute left-0 right-0 z-0">
          <VoiceVisualizer 
            controls={recorderControls} 
            isControlPanelShown={false}
            height={"20px"}
            width={"100%"}
            mainBarColor="#DDD"
            secondaryBarColor="#9D57F9"
            animateCurrentPick={true}
            isProgressIndicatorTimeShown={false}
            isProgressIndicatorTimeOnHoverShown={false}
            />
        </div>

      </div>

      {/* Send Button */}
      <button 
        onClick={() => uploadAudio(recordedBlob)}
        className="h-[2.25rem] pl-0.5 aspect-square bg-myWhite border-tab-gray border-3 
        flex items-center justify-between rounded-full">
        <UploadIcon />
      </button>
    </div>
  )
}