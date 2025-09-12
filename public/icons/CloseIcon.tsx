import { Icon } from "@/components/app.models";

export default function CloseIcon({color, size}: Icon) {
  return (
    <svg width={size || 18} height={size || 18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.875 4.875L13.125 13.125M4.875 13.125L13.125 4.875" 
      stroke={ color || "white"} strokeWidth="0.975" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}