import { Icon } from "@/components/app.models";

export default function DeleteIcon({color}: Icon) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.66667 5H14.3333M5 7.33333H19M17.4444 7.33333L16.899 15.515C16.8172 16.7425 16.7763 17.3563 16.5111 17.8217C16.2777 18.2314 15.9256 18.5608 15.5013 18.7664C15.0193 19 14.4042 19 13.1739 19H10.8261C9.59582 19 8.98069 19 8.49871 18.7664C8.07437 18.5608 7.72229 18.2314 7.48887 17.8217C7.22375 17.3563 7.18283 16.7425 7.101 15.515L6.55556 7.33333M10.4444 10.8333V14.7222M13.5556 10.8333V14.7222" stroke={ color || "black"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}