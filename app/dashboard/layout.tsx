import ClassicButton from "@/components/buttons/ClassicButton";
import Naviation from "@/components/navigation/Navigation";
import NotificationIcon from "@/public/icons/NotificationIcon";
import ShareIcon from "@/public/icons/ShareIcon";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="relative w-full h-screen flex gap-x-[0.75rem] p-[0.75rem]">
      {/* navigation */}
      <aside className="relative w-[16.5%] min-w-[18.5rem] h-full bg-myWhite rounded-[20px] border border-myGray p-[0.9375rem] z-[5]">
        <Naviation />
      </aside>

      {/* content */}
      <div className="w-full border border-myGray/0 h-full flex justify-center items-center">
        <div>
          {children}
        </div>
      </div>

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