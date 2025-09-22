"use client";

import DefaultIcon from "@/public/icons/DefaultIcon";
import { AccountTypes } from "../app.models"
import NoBgButton from "../buttons/NoBgButton";
import LogoutIcon from "@/public/icons/LogoutIcon";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

interface Props {
  userName: string;
  accoutType: AccountTypes;
  avatarUrl?: string;
  collapse: boolean;
  handleSignout: () => void;
}

export default function ProfileDisplay({
  userName, accoutType, avatarUrl,
  collapse, handleSignout }: Props) {
  const avatarRef = useRef(null);
  const hideOnCollapse = "hide-on-collapse";

  useGSAP(() => {
    gsap.to(`.${hideOnCollapse}`, {
      opacity: collapse ? 0 : 1,
      duration: .25
    })

    gsap.to(avatarRef.current, {
      x: collapse ? -2 : 0,
      duration: .25,
      ease: "power3.out"
    })

  }, { dependencies: [collapse] })

  return (
    <div
      style={{ borderTopWidth: collapse ? "0" : "1px" }}
      className={`rounded-[20px] flex bg-myWhite z-[2] items-center absolute 
      border-t border-border-gray/55 bottom-0 left-0 w-full h-[4.5rem] p-[0.9375rem] 
      justify-between`} >
      <div className="flex gap-x-2.5 items-center">
        <div ref={avatarRef} 
          className="relative w-[2.25rem] aspect-square bg-myGray rounded-full flex items-center 
          justify-center">
          {
            !avatarUrl && <DefaultIcon />
          }
          <span 
            role="button" 
            data-collapse={collapse} 
            className="collpase-signout-btn absolute left-0 top-0 z-10">
            <NoBgButton icon={<LogoutIcon />} handleClick={handleSignout} />
          </span>
        </div>
        <div
          className={`${hideOnCollapse} flex flex-col items-start gap-y-0.5`}>
          <span>{userName}</span>
          <span className="text-label-small tracking-label-small text-dark-gray-label">
            {accoutType}
          </span>
        </div>
      </div>

      {/* Sign out button */}
      <span className={`${hideOnCollapse}`}>
        <NoBgButton icon={<LogoutIcon />} handleClick={handleSignout} />
      </span>
    </div>
  )
}