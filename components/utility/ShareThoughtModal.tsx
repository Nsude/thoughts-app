"use client";

import { useGSAP } from "@gsap/react";
import { JSX, useRef, useState } from "react";
import gsap from "gsap";
import { useShareThoughtContext } from "../contexts/ShareThoughtContext";
import ClassicButton from "../buttons/ClassicButton";
import CloseIcon from "@/public/icons/CloseIcon";
import LinkIcon from "@/public/icons/LinkIcon";
import AccessButton from "../buttons/AccessButton";
import LockIcon from "@/public/icons/LockIcon";
import GlobeIcon from "@/public/icons/GlobeIcon";
import { ButtonStatus } from "../app.models";
import CopyIcon from "@/public/icons/CopyIcon";
import CopiedIcon from "@/public/icons/CopiedIcon";

export default function ShareThoughtModal() {
  const { state, toggleDisplay, toggleAccess } = useShareThoughtContext();
  const [shareButtonStatus, setShareButtonStatus] = useState<ButtonStatus>("idle");
  const [linkCopied, setLinkCopied] = useState(false);
  const mainRef = useRef(null);

  useGSAP(() => {
    if (!mainRef.current) return;

    gsap.to(mainRef.current, {
      opacity: state.display ? 1 : 0,
      duration: .4
    })

  }, { scope: mainRef, dependencies: [state.display] });

  const getButtonIcon = (): JSX.Element => {
    if (linkCopied) {
      return <CopiedIcon />
    } else if (state.thoughtLink && !linkCopied) {
      return <CopyIcon />;
    }
    return <LinkIcon color="black" size={24} />;
  }

  const getButtonText = (): string => {
    if (shareButtonStatus === "loading") return "Create Share Link";
    let text;
    if (linkCopied) {
      text = "Share Link Copied";
    } else if (state.thoughtLink && !linkCopied) {
      text = "Copy Share Link";
    } else {
      text = "Create Share Link"
    }
    return text;
  }

  const copiedTimeout = useRef<NodeJS.Timeout>(null);
  const handleButtonClick = async () => {
    if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
    if (state.thoughtLink) {
      navigator.clipboard.writeText(state.thoughtLink);
      setLinkCopied(true);

      copiedTimeout.current = setTimeout(() => {
        setLinkCopied(false);
      }, 3000)
      return;
    }
    setLinkCopied(false);
    setShareButtonStatus("loading");
    await toggleAccess(false);
    setShareButtonStatus("idle");
  }
 
  return (
    <div
      style={{ pointerEvents: state.display ? "all" : "none" }}
      ref={mainRef}
      className=" opacity-0
      fixed z-30 left-0 top-0 bg-myBlack/10 backdrop-blur-[5px]
      w-screen h-screen flex justify-center items-center
    ">
      <div className="relative z-10 p-[1.25rem] rounded-[20px] w-[26rem]
        bg-myWhite flex flex-col gap-y-[1.5625rem] border-3 border-border-gray/50">
        <div className="flex justify-between w-full">
          <div className="flex flex-col gap-y-1.5">
            <span className="text-title">Share Thought</span>
            <span className="text-label-14 text-dark-gray-label">Invite colleagues to brainstorm your ideas.</span>
          </div>

          <ClassicButton
            icon={<CloseIcon size={24} color="black" />}
            handleClick={() => toggleDisplay(false)} />
        </div>

        <div className="relative w-full rounded-[10px] px-[0.75rem] bg-myGray">
          <AccessButton 
            label="Private"
            description="Only you can view"
            id="Private"
            selectedAccess={state.isPrivate ? "Private" : "Public"}
            icon={<LockIcon />}
            handleClick={async () => {
              setLinkCopied(false);
              setShareButtonStatus("loading");
              await toggleAccess(true);
              setShareButtonStatus("idle");
            }}
          />
          <span className="bg-border-gray w-full h-[1px] absolute top-1/2 left-0" />
          <AccessButton 
            label="Public"
            description="Anyone with link can view"
            id="Public"
            selectedAccess={state.isPrivate ? "Private" : "Public"}
            icon={<GlobeIcon />}
            handleClick={async () => {
              setShareButtonStatus("loading");
              await toggleAccess(false);
              setShareButtonStatus("idle");
            }}
          />
        </div>

        <ClassicButton
          handleClick={handleButtonClick}
          fitWidth={true}
          noScaleOnFocus={true}
          text={getButtonText()}
          id="create-share-link"
          selectedId="create-share-link"
          status={shareButtonStatus}
          icon={getButtonIcon()} />
      </div>
    </div>
  )
} 