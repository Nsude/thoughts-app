import ClassicButton from "@/components/buttons/ClassicButton";
import SlateStatusContextProvider from "@/components/contexts/SlateStatusContext";
import Naviation from "@/components/navigation/Navigation";
import NotificationIcon from "@/public/icons/NotificationIcon";
import ShareIcon from "@/public/icons/ShareIcon";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-screen flex gap-x-[0.75rem] p-[0.75rem]">
      {/* navigation */}
      <aside className="relative w-[20.5%] min-w-[18.5rem] h-full bg-myWhite rounded-[20px] border border-border-gray/60 p-[0.9375rem] z-[5] overflow-clip">
        <Naviation />
      </aside>

      {/* content */}
      <SlateStatusContextProvider>
        <div className="w-full h-full flex justify-center items-center">
          {children}
        </div>
      </SlateStatusContextProvider>

      {/* top-right-buttons */}
      <div className="absolute top-[0.75rem] right-[1.38rem] w-fit h-fit flex gap-x-[0.38rem]">
        <ClassicButton icon={<ShareIcon />} text="Share" />
        <ClassicButton icon={<NotificationIcon />} />
      </div>

      {/* version indicator */}
      <div className="absolute"></div>
    </div>
  )
}