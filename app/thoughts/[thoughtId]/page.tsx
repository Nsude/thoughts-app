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
import { Descendant, Editor } from "slate";
import { slateToPlainText } from "@/components/rich-text-editor/slateEditorFunctions";
import { getRandomKeyphrase } from "@/components/utility/ai-helpers";
import { useShareThoughtContext } from "@/components/contexts/ShareThoughtContext";
import ExploreIcon from "@/public/icons/ExploreIcon";
import HamburgerMenu from "@/public/icons/HamburgerMenu";
import { useNavigationContext } from "@/components/contexts/NavigationContext";

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

interface Props {
  params: Promise<{ thoughtId: Id<"thoughts"> }>;
}

export default function ThoughtDocument(
  { params}: Props) {
  const mainRef = useRef(null);
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

  // navigation display context for mobile
  const {showNavigation, setShowNavigation} = useNavigationContext();

  // give the shareThoughtContext access to the thoughtId
  useEffect(() => {
    shareThoughtActions.setThoughtId(thoughtId);
  }, [thoughtId, shareThoughtActions])

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
  const handleAddVersion = async (content: Descendant[]) => {
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

  // close audio modal and close navigation on mobile
  useEffect(() => {
    const handleMouseDown = () => {
      if (audioState.startRecording === false) return;
      audioDispatch({type: "DISPLAY", display: false})
    }

    const handleTouchstart = () => {
      if (!showNavigation) return;
      setShowNavigation(false);
    }
    
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("touchstart", handleTouchstart);
  }, [audioState.startRecording, showNavigation])

  // handle refine idea
  const handleRefineThought = async () => {
    if (thoughtId === "new") return;
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
      console.error(error);
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

  // move document for when navigation is displayed
   const navOverlay = useRef(null);
   useGSAP(() => {
    if (!mainRef.current || !navOverlay.current) return;
    if (window.innerWidth > 1020) return;

    gsap.to(mainRef.current, {
      x: showNavigation ? 0 : -320,
      duration: .4, 
      ease: "power2.out"
    })

    gsap.to(navOverlay.current, {
      opacity: showNavigation ? 1 : 0,
      duration: .4
    })

   }, {dependencies: [showNavigation, navOverlay, mainRef, window.innerWidth]})

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1020) {
        gsap.set(mainRef.current, {x: -320});
        return;
      } 
      gsap.set(mainRef.current, { x: 0 });
      gsap.set(navOverlay.current, {opacity: 0});
    }
    window.addEventListener("resize", handleResize);
  }, [])

  return (
    <div ref={mainRef} className="relative lg:static w-full h-full lg:w-[unset] lg:h-[unset]">
      <span 
        ref={navOverlay} 
        className="absolute left-0 top-0 w-full h-full lg:hidden bg-myBlack/40 
           z-[10] opacity-0 pointer-events-none" />

      <div className="hidden lg:block relative">
        <span
          className="absolute z-0 h-[83vh] w-[40.125rem] rounded-2xl bg-[#DCDCDC] 
          -top-[0.8125rem] left-[1.125rem]" />
        <span
          className="absolute -z-1 h-[83vh] w-[37.875rem] rounded-2xl bg-[#C9C9C9] 
          -top-[1.625rem] left-[2.25rem]" />
      </div>

      <div className="flex justify-center items-center w-full h-full lg:h-[83vh] lg:w-[unset]">
        <div className="relative h-full w-full lg:w-[42.375rem] bg-myWhite border 
          border-border-gray/50 lg:rounded-2xl pt-[4.6rem]">

          {/* Header */}
          <div className="absolute top-0 left-0 w-full px-[1.125rem] h-[4.25rem] flex 
            justify-between items-center">

            {/* Version Title */}
            <div className="flex justify-center items-center gap-x-[1rem]">
              <button onClick={() => setShowNavigation(prev => !prev)}>
                <HamburgerMenu />
              </button>
              {
                selectedVersion?.isCore || thoughtId === "new" ? 
                <h3 className="text-title text-fade-gray">Core</h3>
                : 
                  <div className="flex flex-row text-dark-gray-label items-center gap-1 text-label-14 
                    px-[0.8rem] py-1 rounded-[20px] bg-myGray min-w-fit">
                    <span className="hidden md:block">Parent | </span>
                    <span className="md:hidden block">P | </span>
                  <span className="text-myBlack">{getParentVersionLabel()}</span>
                </div>
              }
            </div>

            <span className="flex items-center gap-x-1.5">
              <SlateStatusDisplay />

              {/* refine idea button */}
              <ClassicButton 
                icon={<ExploreIcon />} 
                text="Refine" 
                handleClick={handleRefineThought} />

              {/* add version button */}
              <ClassicButton 
                icon={<PlusIcon />} 
                handleClick={() => handleAddVersion(currentContent)} />
            </span>
          </div>

          {/* ===== BODY ===== */}
          <div className="relative slim-scrollbar my-slateContainer px-[1.125rem] w-full 
            overflow-y-auto overflow-x-clip max-h-full">
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