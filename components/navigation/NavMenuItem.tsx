"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

interface Props {
  icon: React.ReactNode;
  label: string;
  handleClick: () => void;
}

export default function NavMenuItem({icon, label, handleClick}: Props) {
  const container = useRef(null);
  const span = useRef(null);
  const delay = .2;
  const ease = "power3.out";
  const duration = .25;

  useGSAP(() => {
    gsap.set(span.current, {clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"})
  }, [])

  const getCursorDirection = (e: React.MouseEvent) => {
    const {clientY} = e;
    const button = e.target as HTMLButtonElement;
    const rect = button.getBoundingClientRect();

    const midPoint = rect.top + (rect.height / 2);
    const direction = clientY < midPoint ? "top" : "bottom";

    return direction;

  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    const elem = span.current;
    const direction = getCursorDirection(e);
    
    if (direction === "top") {
      gsap.set(elem, {clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" });

      gsap.to(elem, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration,
        ease,
        delay
      })
    } else {
      gsap.set(elem, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" });

      gsap.to(elem, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration,
        ease,
        delay
      })
    }

  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    const elem = span.current;
    const direction = getCursorDirection(e);

    if (direction === "top") {

      gsap.to(elem, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration,
        ease,
        delay
      })
    } else {

      gsap.to(elem, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        duration,
        ease,
        delay
      })
    }
  }

  return (
    <button 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      ref={container}
      className="my-navMenuItem relative flex gap-x-1.5 items-center h-[2.5rem] w-full rounded-[0.375rem] px-2.5 overflow-clip">
      <span className="z-[1]">{icon}</span>
      <span className="z-[1]">{label}</span>
      <span ref={span} className="absolute left-0 top-0 h-full w-full pointer-events-none z-0" />
    </button>
  )
}