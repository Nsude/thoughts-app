import { Icon } from "@/components/app.models";


export default function TextIcon({ color, small }: Icon) {
  return (
    <div>
      {
        !small ?
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 7.625C5 6.80961 5 6.40191 5.13321 6.0803C5.31083 5.65151 5.65151 5.31083 6.0803 5.13321C6.40191 5 6.80961 5 7.625 5H16.375C17.1904 5 17.5981 5 17.9197 5.13321C18.3485 5.31083 18.6892 5.65151 18.8668 6.0803C19 6.40191 19 6.80961 19 7.625M9.375 19H14.625M12 5V19" stroke={color || "black"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg> :
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.75 5.71875C3.75 5.1072 3.75 4.80143 3.84991 4.56023C3.98312 4.23863 4.23863 3.98312 4.56023 3.84991C4.80143 3.75 5.1072 3.75 5.71875 3.75H12.2812C12.8928 3.75 13.1986 3.75 13.4398 3.84991C13.7614 3.98312 14.0169 4.23863 14.1501 4.56023C14.25 4.80143 14.25 5.1072 14.25 5.71875M7.03125 14.25H10.9688M9 3.75V14.25" stroke={color || "white"} strokeWidth="0.975" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
      }
    </div>
  )
}