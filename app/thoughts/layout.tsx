import ClassicButton from "@/components/buttons/ClassicButton";
import SlateStatusContextProvider from "@/components/contexts/SlateStatusContext";
import Naviation from "@/components/navigation/Navigation";
import Versions from "@/components/versions/Versions";
import NotificationIcon from "@/public/icons/NotificationIcon";
import ShareIcon from "@/public/icons/ShareIcon";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-screen flex gap-x-[0.75rem]">
      {/* navigation */}
      <SlateStatusContextProvider>
        <aside className="
        relative w-[19%] min-w-[18rem] h-full bg-myWhite p-[0.9375rem] z-[5]">
          <Naviation />
        </aside>

        {/* content */}
        <div className="w-full h-full flex justify-center items-center">
          {children}
        </div>

        {/* top-right-buttons */}
        <div className="absolute top-[0.75rem] right-[1.38rem] w-fit h-fit flex gap-x-[0.38rem]">
          <ClassicButton icon={<ShareIcon />} text="Share" />
          <ClassicButton icon={<NotificationIcon />} />
        </div>

        {/* version indicator */}
        <div className="absolute right-[1.5rem] top-[10rem]">
          <Versions />
        </div>
      </SlateStatusContextProvider>
    </div>
  )
}