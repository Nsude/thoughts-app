"use client"

import ClassicButton from "@/components/buttons/ClassicButton";
import TabButton, { easeInOutCubic } from "@/components/buttons/TabButton";
import SlateEditor from "@/components/rich-text-editor/SlateEditor";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { createNewThought } from "@/convex/thoughts";
import LogoIcon from "@/public/icons/LogoIcon";
import MicrophoneIcon from "@/public/icons/MicrophoneIcon";
import PlusIcon from "@/public/icons/PlusIcon";
import TextIcon from "@/public/icons/TextIcon";
import { useGSAP } from "@gsap/react";
import { useAction, useMutation, useQuery } from "convex/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

export default function ThoughtDocument({params}: {params: Promise<{thoughtId: Id<"thoughts">}>}) {
  const [tab, setTab] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const placeholderRef = useRef(null);
  const {thoughtId} = use(params) ;

  const createThought = useMutation(api.thoughts.createNewThought);
  const createDocument = useMutation(api.thoughts.createNewDocument);
  const setCoreThought = useMutation(api.thoughts.setCoreThought);
  const router = useRouter();

  const currentUser = useQuery(api.auth.isAuthenticated);
  const [isDraft, setIsDraft] = useState(true);

  const thoughtCreated = useRef(false);

  // update isDraft
  useEffect(() => {
    if (location.href.includes("/new")) {
      setIsDraft(true);
      thoughtCreated.current = false;
    } else {
      setIsDraft(false);
    }
  }, [router])


  // handle slate value change
  const handleSlateValueChange = async (content: any[]) => {
    if (!content) return;

    // hide or display the placeholder text
    content[0]?.children[0].text?.trim() === "" && content[0]?.type === "paragraph"
      ? setIsEmpty(true) : setIsEmpty(false);

    const isSlateEmpty = isContentPopulated(content);
    
    // if the thought is a fresh unsaved thought
    if (currentUser && !isSlateEmpty && isDraft && !thoughtCreated.current) {
      thoughtCreated.current = true;

      try {
        const thoughtId = await createThought({isPrivate: true});
        if (!thoughtId) return console.error("error creating thought");

        const coreThought = await createDocument({
          title: "Core",
          thoughtFileId: thoughtId,
          content: content,
        })

        // set the document as the core thought document
        await setCoreThought({ thoughtId, coreThought });

        setIsDraft(false);
        router.replace(`/thoughts/${thoughtId}`)

      } catch (error) {
        console.error("Error creating new thought: ", error);
      }
    }
  }

  // check if the editor has any content before saving
  const isContentPopulated = (slateContent: any[]):boolean => {
    if (!slateContent || slateContent.length === 0) return false;

    // Check if there's any actual text content
    const hasText = slateContent.some(node => {
      if (node.children) {
        const value = node.children.some((child: any) =>
          child.text && child.text.trim().length > 50
        );
        if (value) return false;
      }
      return true;
    });

    return hasText;
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

            {/* ===== SLATE RICH TEXT EDITOR ===== */}
            <SlateEditor 
              handleClick={() => setTab(1)} 
              handleValueChange={handleSlateValueChange} 
              thoughtId={thoughtId} />
          </div>

          {/* Tabs */}
          <div className="absolute bottom-[0.9375rem] left-1/2 -translate-x-1/2">
            <TabButton
              tabIcon1={<MicrophoneIcon />}
              tabIcon2={<TextIcon />}
              handleClick={(tab) => setTab(tab)}
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