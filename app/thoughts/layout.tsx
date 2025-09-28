"use client";

import ClassicButton from "@/components/buttons/ClassicButton";
import SlateStatusContextProvider from "@/components/contexts/SlateStatusContext";
import Naviation from "@/components/navigation/Navigation";
import { ConfirmationProvider } from "@/components/contexts/ConfirmationContext";
import Versions from "@/components/versions/Versions";
import ShareIcon from "@/public/icons/ShareIcon";
import { useShareThoughtContext } from "@/components/contexts/ShareThoughtContext";
import { PropsWithChildren } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { shareThoughtActions } = useShareThoughtContext();

  return (
    <div className="relative overflow-clip w-full h-[100dvh] max-h-[100dvh] lg:h-screen 
      flex gap-x-[0.75rem]">
      {/* navigation */}
      <ProtectedRoute>
        <ConfirmationProvider>
          <SlateStatusContextProvider>
            <Naviation />

            {/* content */}
            <div className="w-full h-full flex justify-center items-center">
              {children}
            </div>

            {/* top-right-buttons */}
            <div className="absolute bottom-5 lg:bottom-[unset] left-5 lg:left-[unset] lg:top-[0.75rem] lg:right-[1.38rem] w-fit h-fit flex 
              gap-x-[0.38rem]">
              <ClassicButton
                icon={<ShareIcon />}
                text="Share"
                handleClick={() => shareThoughtActions.toggleDisplay(true)} />
            </div>

            {/* version indicator */}
            <div className="absolute right-[1.5rem] top-[8rem] lg:top-[10rem] rounded-[10px] 
              bg-myGray/40 backdrop-blur-[4px] py-[0.75rem] pl-[0.75rem] lg:bg-[unset] 
              lg:backdrop-blur-[unset] lg:py-[unset] lg:pl-[unset]">
              <Versions />
            </div>
          </SlateStatusContextProvider>
        </ConfirmationProvider>
      </ProtectedRoute>
    </div>
  )
}