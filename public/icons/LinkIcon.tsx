import { Icon } from "@/components/app.models";

export default function LinkIcon({color, size}: Icon) {
  return (
    <svg width={size || "18"} height={size || "18"} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.2 12H6C4.34315 12 3 10.6568 3 9C3 7.34315 4.34315 6 6 6H7.2M10.8 12H12C13.6568 12 15 10.6568 15 9C15 7.34315 13.6568 6 12 6H10.8M6 9H12" stroke={color || "white"} strokeWidth="0.975" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}