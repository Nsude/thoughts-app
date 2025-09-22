"use client"

import ClassicButton from "@/components/buttons/ClassicButton";
import TabButton, { easeInOutCubic } from "@/components/buttons/TabButton";
import { useSlateStatusContext } from "@/components/contexts/SlateStatusContext";
import { useSlateEditorState } from "@/components/hooks/useSlateEditorState";
import { PlaceholderDisplay } from "@/components/rich-text-editor/PlaceholderDisplay";
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
import { useConfirmation } from "@/components/contexts/ConfirmationContext";
import { useToastContext } from "@/components/contexts/ToastContext";
import { Editor } from "slate";
import { slateToPlainText } from "@/components/rich-text-editor/slateEditorFunctions";
import { getRandomKeyphrase } from "@/components/utility/ai-helpers";
import { useShareThoughtContext } from "@/components/contexts/ShareThoughtContext";

const initialAudioModalState: AudioModalState = {
  display: false,
  startRecording: false,
  targetId: "",
  status: "idle"
}

const audioModalReducer = (
  state: AudioModalState, 
  action: AudioModalAction):AudioModalState => {
  switch(action.type) {
    case "DISPLAY":
      return { ...state, display: action.display }
    case "START_RECORDING":
      return { ...state, startRecording: action.start };
    case "PRESSED_BUTTON":
      return {...state, targetId: action.targetId};
    case "STATUS":
      return {...state, status: action.status}
  }
}

export default function ThoughtDocument(
  { params }: { params: Promise<{ thoughtId: Id<"thoughts"> }> 
}) {
  const [tab, setTab] = useState(0);
  const { thoughtId } = use(params);
  const placeholderRef = useRef(null);
  const editorState = useSlateEditorState();
  const { 
    slateStatus, 
    setSlateStatus, 
    currentContent, 
    setCurrentContent,
    setAllowContent
  } = useSlateStatusContext();
  const {confirmAction} = useConfirmation();

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

  // convex actions 
  const refineThought = useAction(api.refine.refineThought);
  const surpriseMe = useAction(api.refine.surpriseMe);

  // toast notification
  const { setToast } = useToastContext();

  // Single handler for all editor changes
  const handleEditorChange = useCallback((editor: Editor) => {
    editorState.setEditor(editor);
    editorState.setChanged(prev => !prev);
  }, [editorState]);

  // share thought state
  const {shareThoughtActions} = useShareThoughtContext();

  // give the shareThoughtContext access to the thoughtId
  useEffect(() => {
    shareThoughtActions.setThoughtId(thoughtId);
  }, [thoughtId])

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
  const handleAddVersion = async (content: any[]) => {
    if (versions && versions.length > 9) {
      setToast({
        title: "Version Limit Exceeded",
        msg: "Easy now tiger, maybe you should create a new thought thread instead",
        isError: true,
        showToast: true
      })
      return;
    };
    setSlateStatus("loading");

    try {
      if (!versions) throw new Error("versions is undefined");

      await createVersion({
        thoughtId,
        content: content,
        versionNumber: versions.length + 1,
        isCore: false,
        createdAt: Date.now(),
        parentVersionNumber: selectedVersion?.versionNumber
      })

      setSlateStatus("saved");
      setToast({
        title: "New Version Created",
        msg: "A new version has been Successfully created",
        isError: false,
        showToast: true
      })
    } catch (error) {
      setSlateStatus("error");
      console.error(error);
      setToast({
        title: "Add-version Failed",
        isError: true,
        showToast: true
      })
    }
  }

  // handle delete version from thought document delete button
  const handleDeleteVersion = async () => {
    const confirmDelete = await confirmAction();
    if (!confirmDelete) return; 
    
    try {
      setSlateStatus("deleting");
      await deleteVersion({ thoughtId: thoughtId })
      setToast({
        title: "Delete Successful",
        isError: false,
        showToast: true
      })
    } catch (error) {
      console.error(error)
      setToast({
        title: "Delete Error",
        isError: true,
        showToast: true
      })
    }
  }

  // handle record tab clicked 
  const isRecording = useRef(false);
  const handleRecordTabClicked = useCallback( async () => {
    if (!audioState.display) audioDispatch({type: "DISPLAY", display: true}); 
    startRecording();

  }, [audioState.display])

  const startRecording = () => {
    isRecording.current = true;
    audioDispatch({ type: "START_RECORDING", start: true });
  }

  // stop recording input
  const stopRecording = () => {
    isRecording.current = false;
    audioDispatch({ type: "START_RECORDING", start: false });
  }

  // HANDLE UPLOAD AUDIO
  const generateUploadUrl = useMutation(api.audio.generateUploadUrl);
  const transcribeAudio = useAction(api.audio.transcribeAudio);
  const handleTranscribeAudio = async (recordedBlob: Blob | null) => {
    if (audioState.status === "loading") {
      setToast({
        title: "Multiple Upload Request",
        msg: "The current audio is already being transcribed, please wait.",
        isError: true,
        showToast: true
      })
      return;
    };

    audioDispatch({type: "PRESSED_BUTTON", targetId: "upload-button"});
    audioDispatch({type: "STATUS", status: "loading"});

    try {
      if (!recordedBlob) throw new Error("Client Error: Blob does not exit");
      // get upload url from convex
      const uploadUrl = await generateUploadUrl();

      // upload
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {"Content-Type": recordedBlob.type},
        body: recordedBlob
      })

      // set transcribed audio to current slate content
      const {storageId} = await response.json();
      const audioTranscribedToslateContent = await transcribeAudio({storageId});
      setAllowContent(true);
      setCurrentContent(audioTranscribedToslateContent);

      audioDispatch({type: "STATUS", status: "idle"});
      audioDispatch({type: "DISPLAY", display: false});
      
    } catch (error) {
      console.error(error);
      setToast({
        title: "Audio Error",
        isError: true,
        showToast: true
      })
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

  // handle refine idea
  const handleRefineThought = async () => {
    const thoughtToPlainText = slateToPlainText(currentContent);
    setSlateStatus("loading");
    try {
      const refinedText = await refineThought({userIdea: thoughtToPlainText});
      await handleAddVersion(refinedText);
      setSlateStatus("idle");
    } catch (error) {
      setSlateStatus("error");
      console.error(error);
      setToast({
        title: "Refine Error",
        isError: true,
        showToast: true
      })
    }
  }

  // generates random text
  const handleSurpriseMe = async () => {
    setSlateStatus("loading");
    try {
      const content = await surpriseMe({keyPhrase: getRandomKeyphrase()});
      setAllowContent(true);
      setCurrentContent(content);

      setSlateStatus("idle")
    } catch (error) {
      setSlateStatus("error");
      setToast({
        title: "A Tiny Error",
        isError: true,
        showToast: true
      })
    }
  }

  // get the right text for the parent version
  const getParentVersionLabel = ():string => {
    if (!versions) return "";
    if (selectedVersion?.parentVersionNumber === 1 || !selectedVersion?.parentVersionNumber) return "Core Version";
    const versionNumber = selectedVersion?.parentVersionNumber;
    return versions.length < 9 ? "Version 0" + versionNumber : "Version " + versionNumber;
   }

  return (
    <div>
      <div className="relative">
        <span
          className="absolute z-0 h-[83vh] w-[40.125rem] rounded-2xl bg-[#DCDCDC] 
          -top-[0.8125rem] left-[1.125rem]" />
        <span
          className="absolute -z-1 h-[83vh] w-[37.875rem] rounded-2xl bg-[#C9C9C9] 
          -top-[1.625rem] left-[2.25rem]" />
      </div>

      <div className="flex justify-center items-center h-[83vh]">
        <div className="relative h-full w-[42.375rem] bg-myWhite border border-border-gray/50 
          rounded-2xl pt-[4.6rem]">

          {/* Header */}
          <div className="absolute top-0 left-0 w-full px-[1.125rem] h-[4.25rem] flex 
            justify-between items-center">

            {/* Version Title */}
            {
              selectedVersion?.isCore || thoughtId === "new" ? 
              <h3 className="text-title text-fade-gray">Core</h3>
              : 
                <div className="flex text-dark-gray-label items-center gap-1 text-label-14 
                  px-[0.8rem] py-1 rounded-[20px] bg-myGray ">
                  <span className="">Parent | </span>
                <span className="text-myBlack">{getParentVersionLabel()}</span>
              </div>
            }

            <span className="flex items-center gap-x-1.5">
              <SlateStatusDisplay />

              {/* refine idea button */}
              <ClassicButton 
                icon={<LogoIcon />} 
                text="Refine" 
                handleClick={handleRefineThought} />

              {/* add version button */}
              <ClassicButton icon={<PlusIcon />} handleClick={() => handleAddVersion(currentContent)} />
            </span>
          </div>

          {/* ===== BODY ===== */}
          <div className="relative slim-scrollbar my-slateContainer px-[1.125rem] w-full 
            overflow-y-scroll overflow-x-clip max-h-full">
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
              handleExceedRecordLimit={() => stopRecording()}
              uploadAudio={(audioBlob) => handleTranscribeAudio(audioBlob)}
              targetId={audioState.targetId}
              status={audioState.status}
              />
          </div>

          {/* Suprise Me & delete version */}
          <div className="absolute bottom-[1.125rem] right-[1.125rem] flex gap-x-1.5">
            {/* delete button */}
            <div style={{
              opacity: selectedVersion?.isCore || thoughtId === "new" ? .5 : 1,
              pointerEvents: selectedVersion?.isCore || thoughtId === "new" ? "none" : "all"
            }}>
              <ClassicButton
                icon={<DeleteIcon />}
                handleClick={handleDeleteVersion} />
            </div>

            {
              editorState.currentBlock.isEditorEmpty && slateStatus === "idle" ?
                <div title="Surprise me">
                  <ClassicButton
                    icon={<LogoIcon />}
                    handleClick={handleSurpriseMe} />
                </div>
                : null
            }
          </div>
        </div>
      </div>
    </div>
  )
}