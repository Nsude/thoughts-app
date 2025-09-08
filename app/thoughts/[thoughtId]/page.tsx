"use client"

import ClassicButton from "@/components/buttons/ClassicButton";
import TabButton, { easeInOutCubic } from "@/components/buttons/TabButton";
import { useSlateStatusContext } from "@/components/contexts/SlateStatusContext";
import { useSlateEditorState } from "@/components/hooks/useSlateEditorState";
import { PlaceholderDisplay } from "@/components/rich-text-editor/PlaceholderDisplay";
import { BlockType } from "@/components/rich-text-editor/slate";
import SlateEditor from "@/components/rich-text-editor/SlateEditor";
import SlateStatusDisplay from "@/components/rich-text-editor/EditorStatus";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import LogoIcon from "@/public/icons/LogoIcon";
import MicrophoneIcon from "@/public/icons/MicrophoneIcon";
import PlusIcon from "@/public/icons/PlusIcon";
import TextIcon from "@/public/icons/TextIcon";
import { useGSAP } from "@gsap/react";
import { useAction, useMutation, useQuery } from "convex/react";
import gsap from "gsap";
import { use, useCallback, useEffect, useReducer, useRef, useState } from "react";
import DeleteIcon from "@/public/icons/DeleteIcon";
import AudioInputModal from "@/components/audio-input/AudioInputModal";
import StopIcon from "@/public/icons/StopIcon";
import { AudioModalAction, AudioModalState } from "@/components/app.models";

const initialAudioModalState: AudioModalState = {
  display: false,
  startRecording: false,
  blob: null
}

const audioModalReducer = (state: AudioModalState, action: AudioModalAction) => {
  switch(action.type) {
    case "DISPLAY":
      return {
        ...state,
        display: action.display
      } as AudioModalState;
    case "START_RECORDING":
      return {
        ...state,
        startRecording: action.start
      } as AudioModalState;
    case "BLOB":
      return {
        ...state,
        blob: action.blob
      } as AudioModalState
  }
}

export default function ThoughtDocument({ params }: { params: Promise<{ thoughtId: Id<"thoughts"> }> }) {
  const [tab, setTab] = useState(0);
  const { thoughtId } = use(params);
  const placeholderRef = useRef(null);
  const editorState = useSlateEditorState(thoughtId);
  const { slateStatus, setSlateStatus } = useSlateStatusContext();

  // audio modal state
  const [audioState, audioDispatch] = useReducer(audioModalReducer, initialAudioModalState);

  // convex mutations & queries
  const createVersion = useMutation(api.thoughts.createVersion);
  const deleteVersion = useMutation(api.thoughts.deleleVersion);
  const versions = useQuery(api.thoughts.getThoughtVersions,
    thoughtId !== "new" ? { thoughtId } : "skip"
  );
  const selectedVersion = useQuery(
    api.thoughts.getSelectedVersion,
    thoughtId !== "new" ? { thoughtId } : "skip"
  )

  // Single handler for all editor changes
  const handleEditorChange = useCallback((newState: {
    content: any[],
    blockType: BlockType,
    isEmpty: boolean,
    isSlashOnly: boolean,
    headingLevel?: number
  }) => {
    editorState.setContent(newState.content);
    editorState.setCurrentBlock({
      type: newState.blockType,
      isEmpty: newState.isEmpty,
      isSlashOnly: newState.isSlashOnly,
      headingLevel: newState.headingLevel || 0
    });
  }, [editorState]);

  // switch placeholder depending on selected tab
  useGSAP(() => {
    const con = placeholderRef.current;
    if (!con) return;

    gsap.to(con, {
      yPercent: tab * -150,
      duration: .4,
      ease: easeInOutCubic
    })

  }, { dependencies: [tab] });


  // handle add versions
  const handleAddVersion = async () => {
    if (versions && versions.length > 9) return;
    setSlateStatus("loading");

    try {
      if (!versions) throw new Error("versions is undefined");

      await createVersion({
        thoughtId,
        content: editorState.content,
        versionNumber: versions.length + 1,
        isCore: false,
        createdAt: Date.now()
      })

      setSlateStatus("saved");
    } catch (error) {
      setSlateStatus("error");
      console.error(error);
    }
  }

  // handle delete version
  const handleDeleteVersion = async () => {
    try {
      setSlateStatus("deleting");
      await deleteVersion({ thoughtId: thoughtId })
    } catch (error) {
      console.error(error)
    }
  }

  // handle record tab clicked 
  const isRecording = useRef(false);
  const audioChunks = useRef<any[]>([]);
  const mediaRecorder = useRef<MediaRecorder>(null);
  const handleRecordTabClicked = useCallback( async () => {
    if (!audioState.display) audioDispatch({type: "DISPLAY", display: true}); 

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      // check if the browser media recorder supports the webm format
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        mediaRecorder.current = new MediaRecorder(stream, {mimeType: "audio/webm"});
      } else {
        mediaRecorder.current = new MediaRecorder(stream, {mimeType: "audio/mp4"});
      }

      // clear previous chunks
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      }

      // create blob then create audio url from the blob
      mediaRecorder.current.onstop = () => {
        if (audioChunks.current.length > 0) {
          const audioBlob = new Blob(audioChunks.current, {type: "audio/webm"});
  
          const audioUrl = URL.createObjectURL(audioBlob);
          audioDispatch({type: "BLOB", blob: audioBlob});

        } else {
          console.error("no audio chunks to create blob from ❌")
        }
      }

      startRecording();
    } catch(error) {
      console.error(error);
    }


  }, [audioState.display])

  const startRecording = () => {
    if (!mediaRecorder.current) return console.log("media recorder not initialised ❌");
    audioDispatch({type: "BLOB", blob: null});

    isRecording.current = true;
    audioDispatch({ type: "START_RECORDING", start: true });

    mediaRecorder.current.start();
  }

  const stopRecording = () => {
    if (!mediaRecorder.current) return;

    isRecording.current = false;
    audioDispatch({ type: "START_RECORDING", start: false });

    mediaRecorder.current.stop();
  }

  // HANDLE UPLOAD AUDIO
  const generateUploadUrl = useMutation(api.audio.generateUploadUrl);
  const transcribeAudio = useAction(api.audio.transcribeAudio);
  const handleUploadAudio = async () => {
    try {
      if (!audioState.blob) throw new Error("Client Error: Blob does not exit");
      // get upload url from convex
      const uploadUrl = await generateUploadUrl();

      // upload
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {"Content-Type": audioState.blob.type},
        body: audioState.blob
      })

      const {storageId} = await response.json();

      const transcribedText = await transcribeAudio({storageId})
      console.log(transcribedText);
      
    } catch (error) {
      console.error(error);
    }
  }

  // close audio modal
  useEffect(() => {
    const handleMouseDown = () => {
      if (isRecording.current) return;
      audioDispatch({type: "DISPLAY", display: false})
    }

    window.addEventListener("mousedown", handleMouseDown);
  }, [isRecording.current])

  return (
    <div>
      <div className="relative">
        <span
          className="absolute z-0 h-[83vh] w-[40.125rem] rounded-2xl bg-[#DCDCDC] -top-[0.8125rem] left-[1.125rem]" />
        <span
          className="absolute -z-1 h-[83vh] w-[37.875rem] rounded-2xl bg-[#C9C9C9] -top-[1.625rem] left-[2.25rem]" />
      </div>

      <div className="flex justify-center items-center h-[83vh]">
        <div className="relative h-full w-[42.375rem] bg-myWhite border border-border-gray/60 rounded-2xl pt-[4.6rem]">

          {/* Header */}
          <div className="absolute top-0 left-0 w-full px-[1.125rem] h-[4.25rem] flex justify-between items-center">
            <h3 className="text-title text-fade-gray">Core</h3>
            <span className="flex items-center gap-x-1.5">
              <SlateStatusDisplay />

              {/* refine idea button */}
              <ClassicButton icon={<LogoIcon />} text="Refine" />

              {/* add version button */}
              <ClassicButton icon={<PlusIcon />} handleClick={handleAddVersion} />
            </span>
          </div>

          {/* ===== BODY ===== */}
          <div className="relative slim-scrollbar my-slateContainer px-[1.125rem] w-full overflow-y-scroll overflow-x-clip">
            {/* Placeholder msg */}
            <PlaceholderDisplay
              placeholderRef={placeholderRef}
              placeholderState={editorState.placeholderState}
            />

            {/* ===== SLATE RICH TEXT EDITOR ===== */}
            <SlateEditor
              handleClick={useCallback(() => setTab(1), [])}
              onChange={handleEditorChange}
              thoughtId={thoughtId} />
          </div>

          {/* ==== AUDIO AND TEXT INPUT TABS ==== */}
          <div className="absolute bottom-[0.9375rem] left-1/2 -translate-x-1/2">
            <TabButton
              tabIcon1={
                !isRecording.current ? 
                <MicrophoneIcon /> : <StopIcon />
              }
              tabIcon2={<TextIcon />}
              handleTab1Click={!isRecording.current ? handleRecordTabClicked : stopRecording}
              handleClick={useCallback((tab) => setTab(tab), [])}
              preselectTab={tab}
            />

            {/* Audio Input Component */}
            <AudioInputModal 
              display={audioState.display}
              startRecording={audioState.startRecording}
              audioBlob={audioState.blob}
              handleExceedRecordLimit={() => stopRecording()}
              UploadAudio={handleUploadAudio}
              />
          </div>

          {/* Suprise Me / delete version */}
          <div className="absolute bottom-[1.125rem] right-[1.125rem] flex gap-x-1.5">
            {
              editorState.currentBlock.isEmpty && slateStatus === "idle" ?
                <div title="Surprise me">
                  <ClassicButton
                    icon={<LogoIcon />}
                    handleClick={() => console.info("Suprise-me clicked")} />
                </div>
                : null
            }

            {/* delete button */}
            <div style={{
              opacity: selectedVersion?.isCore || thoughtId === "new" ? .5 : 1,
              pointerEvents: selectedVersion?.isCore || thoughtId === "new" ? "none" : "all"
            }}>
              <ClassicButton
                icon={<DeleteIcon />}
                handleClick={handleDeleteVersion} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}