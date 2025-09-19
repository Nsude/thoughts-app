"use client";

import ClassicButton from "@/components/buttons/ClassicButton";
import SlateStatusContextProvider from "@/components/contexts/SlateStatusContext";
import Naviation from "@/components/navigation/Navigation";
import { ConfirmationProvider } from "@/components/contexts/ConfirmationContext";
import Versions from "@/components/versions/Versions";
import NotificationIcon from "@/public/icons/NotificationIcon";
import ShareIcon from "@/public/icons/ShareIcon";
import { useShareThoughtContext } from "@/components/contexts/ShareThoughtContext";
import { PropsWithChildren } from "react";

export default function DashboardLayout({ children }: PropsWithChildren) {
  const {shareThoughtActions} = useShareThoughtContext();

  return (
    <div className="relative w-full h-screen flex gap-x-[0.75rem]">
      {/* navigation */}
      <ConfirmationProvider>
          <SlateStatusContextProvider>
            <aside className="
            relative w-[19%] min-w-[18rem] h-full bg-myWhite p-[0.9375rem] z-[5] border-r-1 border-border-gray/50">
              <Naviation />
            </aside>

            {/* content */}
            <div className="w-full h-full flex justify-center items-center">
              {children}
            </div>

            {/* top-right-buttons */}
            <div className="absolute top-[0.75rem] right-[1.38rem] w-fit h-fit flex gap-x-[0.38rem]">
              <ClassicButton 
                icon={<ShareIcon />} 
                text="Share" 
                handleClick={() => shareThoughtActions.toggleDisplay(true)} />

              <ClassicButton icon={<NotificationIcon />} />
            </div>

            {/* version indicator */}
            <div className="absolute right-[1.5rem] top-[10rem]">
              <Versions />
            </div>
          </SlateStatusContextProvider>
      </ConfirmationProvider>
    </div>
  )
}