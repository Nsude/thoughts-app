"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

interface Props {
  tab1: string;
  tab2: string;
}

export const easeInOutCubic = CustomEase.create("custom", "0.65, 0, 0.35, 1");

export default function TabButton({tab1, tab2}: Props) {
  const [tab, setTab] = useState(tab1);
  const container = useRef(null);
  const indicator = useRef(null);

  useGSAP(() => {
    if (!container.current) return;
    const translateFactor = tab.toLowerCase() === tab1.toLowerCase() ? 0 : 1;
    const main = container.current as HTMLDivElement;
    const button1 = main.children[0];
    const button2 = main.children[1];

    // clear prev selection and set new 
    main.querySelector(".selected-tab")?.classList.remove("selected-tab");
    if (!translateFactor) {
      button1.classList.add("selected-tab");
    } else {
      button2.classList.add("selected-tab");
    }

    // animate indicator 
    gsap.to(indicator.current, { xPercent: 100 * translateFactor, duration: .4, ease: easeInOutCubic });

  }, {scope: container, dependencies: [tab]});

  return (
    <div ref={container} className="my-tabButton relative flex items-center w-full bg-tab-gray rounded-[9px]">
      <button 
        onClick={() => setTab(tab1)}
        className="h-[2.7rem] w-full flex justify-center items-center">
          {tab1}
        </button>

      <button 
        onClick={() => setTab(tab2)}
        className="h-[2.7rem] w-full flex justify-center items-center">
        {tab2}
      </button>
      <span ref={indicator} className="my-tabIndicator absolute z-0 bottom-[3px] left-[3px] top-[3px] bg-myWhite rounded-[6px]" />
    </div>
  )
}