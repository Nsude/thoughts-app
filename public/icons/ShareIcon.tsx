import { Icon } from "@/components/app.models";

export default function ShareIcon({color}: Icon) {
  return (
    <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 14.3333V15.2667C19 16.5735 19 17.2268 18.7457 17.726C18.522 18.1651 18.1651 18.522 17.726 18.7457C17.2268 19 16.5735 19 15.2667 19H8.73333C7.42654 19 6.77315 19 6.27402 18.7457C5.83498 18.522 5.47802 18.1651 5.25432 17.726C5 17.2268 5 16.5735 5 15.2667V14.3333M15.8889 8.88889L12 5M12 5L8.11111 8.88889M12 5V14.3333" stroke={color || "black"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}