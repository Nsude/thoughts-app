"use client";

import { Icon } from "@/components/app.models";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function LoadingIcon({color}: Icon) {
  const svgRef = useRef(null);

  useGSAP(() => {
    gsap.to(svgRef.current, {
      rotate: "365deg",
      repeat: -1,
      duration: .4,
      ease: "none"
    })

  }, {scope: svgRef})
  
  return (
    <svg ref={svgRef} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.58149 3V4.49525M9.58149 12.4201V14.8125M5.84335 8.83149H3.75M15.1139 8.83149H14.2168M13.4435 12.6935L13.0206 12.2706M13.5674 4.89346L12.7215 5.7393M5.34787 13.0651L7.03956 11.3734M5.47174 4.76959L6.74051 6.03835" stroke="url(#paint0_linear_312_354)" strokeWidth="1.1962" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="paint0_linear_312_354" x1="4.875" y1="4.5" x2="13.125" y2="12.75" gradientUnits="userSpaceOnUse">
          <stop />
          <stop offset="0.668626" stopColor={color || "#9C9C9C"} />
        </linearGradient>
      </defs>
    </svg>
  )
}