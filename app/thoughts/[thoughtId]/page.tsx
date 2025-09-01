"use client"

import ClassicButton from "@/components/buttons/ClassicButton";
import TabButton, { easeInOutCubic } from "@/components/buttons/TabButton";
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
  const placeholderRef = useRef(null);
  const {thoughtId} = use(params);

  const getHeaderFontSizeAndLevel = () => {
    const level = headerPlaceHolder?.level;
    if (!level) return null;

    const fontSize = level === 1 ? "2.5rem" : level === 2 ? "2.25rem" : level === 3 ? "1.75rem" : "";
    return {fontSize, level}
  }

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
  const onBlockTypeChange = useCallback((blockType: BlockType, isSlashOnly: boolean, level?: number) => {
    if (blockType !== "heading" || !isSlashOnly || !level) return;
    
    const domSelection = document.getSelection();
    if (!domSelection || !domSelection.isCollapsed) return;

    // get the position of the cursor
    const {top} = domSelection.getRangeAt(0).getBoundingClientRect();
    console.log("triggered")
    // headerPlaceHolder.current = {y: top, level};
    setHeaderPlaceholder({y: top, level});
  }, [])

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
              <ClassicButton icon={<LogoIcon />} text="Refine" />
              <ClassicButton icon={<PlusIcon />} />
            </span>
          </div>

          {/* ===== BODY ===== */}
          <div className="relative slim-scrollbar my-slateContainer px-[1.125rem] w-full overflow-y-scroll overflow-x-clip">
            {/* Placeholder msg */}

            <div className="absolute w-full overflow-clip" 
            style={{
              pointerEvents: isEmpty ? "all" : 'none',
              opacity: isEmpty ? "1" : '0'
              }}>
              <div ref={placeholderRef} className="leading-[1.5] relative flex flex-col">
                <span className="text-fade-gray"> Let's hear it... </span>
                <span className="text-fade-gray absolute -bottom-[150%]"> Write or type '/' for commands... </span>
              </div>
            </div>

            {/* ===== Header Level Indicator ===== */}
            <div 
              style={{
                opacity: headerPlaceHolder ? 1 : 0,
                top: headerPlaceHolder?.y + "px",
                fontSize: getHeaderFontSizeAndLevel()?.fontSize,
                // transform: `translateX(${
                //   getHeaderFontSizeAndLevel()?.level === 1 ? 1.6 : 1.3
                // }rem)`
              }}
              className="fixed mt-1.5 font-extrabold"
            >
              <span className="opacity-25"> Heading {getHeaderFontSizeAndLevel()?.level} </span>
            </div>

            {/* ===== SLATE RICH TEXT EDITOR ===== */}
            <SlateEditor 
              handleClick={useCallback(() => setTab(1), [])} 
              handleValueChange={(content, checkIsBlockSlashOnly, editor) => {
                // hide or display the placeholder text
                content[0]?.children[0].text?.trim() === "" && content[0]?.type === "paragraph"
                  ? setIsEmpty(true) : setIsEmpty(false);

                const isSlashOnly = checkIsBlockSlashOnly(editor);
                if (isSlashOnly) return;
                setHeaderPlaceholder(null); 
              }} 
              thoughtId={thoughtId} 
              handleBlockTypeChange={(blockType, isBlockEmpty, level) => onBlockTypeChange(blockType, isBlockEmpty, level)}/>
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