"use client"

import ClassicButton from "@/components/buttons/ClassicButton";
import TabButton, { easeInOutCubic } from "@/components/buttons/TabButton";
import { useSlateEditorState } from "@/components/hooks/useSlateEditorState";
import { PlaceholderDisplay } from "@/components/rich-text-editor/PlaceholderDisplay";
import { BlockType } from "@/components/rich-text-editor/slate";
import SlateEditor from "@/components/rich-text-editor/SlateEditor";
import SlateStatusDisplay from "@/components/rich-text-editor/Status";
import { Id } from "@/convex/_generated/dataModel";
import LogoIcon from "@/public/icons/LogoIcon";
import MicrophoneIcon from "@/public/icons/MicrophoneIcon";
import PlusIcon from "@/public/icons/PlusIcon";
import TextIcon from "@/public/icons/TextIcon";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { use, useCallback, useRef, useState } from "react";

export default function ThoughtDocument({params}: {params: Promise<{thoughtId: Id<"thoughts">}>}) {
  const [tab, setTab] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const [headerPlaceHolder, setHeaderPlaceholder] = useState<{y: number, level: number} | null>(null);
  
  // new implementation
  const {thoughtId} = use(params);
  const placeholderRef = useRef(null);
  const editorState = useSlateEditorState(thoughtId);


  // const getHeaderFontSizeAndLevel = () => {
  //   const level = headerPlaceHolder?.level;
  //   if (!level) return null;

  //   const fontSize = level === 1 ? "2.5rem" : level === 2 ? "2.25rem" : level === 3 ? "1.75rem" : "";
  //   return {fontSize, level}
  // }

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

  }, {dependencies: [tab]})

  // display message when header block type is selected on an empty paragraph
  // const onBlockTypeChange = useCallback((blockType: BlockType, isSlashOnly: boolean, level?: number) => {
  //   if (blockType !== "heading" || !isSlashOnly || !level) return;
    
  //   const domSelection = document.getSelection();
  //   if (!domSelection || !domSelection.isCollapsed) return;

  //   // get the position of the cursor
  //   const {top} = domSelection.getRangeAt(0).getBoundingClientRect();
  //   console.log("triggered")
  //   // headerPlaceHolder.current = {y: top, level};
  //   setHeaderPlaceholder({y: top, level});
  // }, []);


  // handle add versions
  const handleAddVersion = () => {
    console.log("version added")
  }

  return (
    <div>
      <div className="relative">
        <span 
        className="absolute z-0 h-[49.75rem] w-[40.125rem] rounded-2xl bg-[#DCDCDC] -top-[0.8125rem] left-[1.125rem]" />
        <span 
        className="absolute -z-1 h-[49.75rem] w-[37.875rem] rounded-2xl bg-[#C9C9C9] -top-[1.625rem] left-[2.25rem]" />
      </div>

      <div className="flex justify-center items-center">
        <div className="relative h-[49.75rem] w-[42.375rem] bg-myWhite border border-border-gray/60 rounded-2xl pt-[4.6rem]">

          {/* Header */}
          <div className="absolute top-0 left-0 w-full px-[1.125rem] h-[4.25rem] flex justify-between items-center">
            <h3 className="text-title text-fade-gray">Core</h3>
            <span className="flex items-center gap-x-1.5">
              <SlateStatusDisplay />

              {/* refine idea button */}
              <ClassicButton icon={<LogoIcon />} text="Refine" />

              {/* add version button */}
              <ClassicButton icon={<PlusIcon />} handleClick={handleAddVersion}/>
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

          {/* Tabs */}
          <div className="absolute bottom-[0.9375rem] left-1/2 -translate-x-1/2">
            <TabButton
              tabIcon1={<MicrophoneIcon />}
              tabIcon2={<TextIcon />}
              handleClick={useCallback((tab) => setTab(tab), [])}
              preselectTab={tab}
            />
          </div>

          {/* Suprise Me */}
          <div className="absolute bottom-[1.125rem] right-[1.125rem]">
            <ClassicButton icon={<LogoIcon />} />
          </div>
        </div>
      </div>
    </div>
  )
}