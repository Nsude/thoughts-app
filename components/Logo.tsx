import LogoMark from "@/public/LogoMark";

export default function Logo() {
  return (
    <div className="flex items-center gap-x-1.5 ">
      <LogoMark size={18} />
      <span className="text-[1.4rem] cursor-default">thoughts</span>
    </div>
  )
}