"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

interface Props {
  tab1?: string;
  tab2?: string;
  tabIcon1?: React.ReactNode;
  tabIcon2?: React.ReactNode;
  handleClick: (tab: number) => void;
}

export const easeInOutCubic = CustomEase.create("custom", "0.65, 0, 0.35, 1");

export default function TabButton({tab1, tab2, tabIcon1, tabIcon2, handleClick}: Props) {
  const [tab, setTab] = useState(0);
  const container = useRef(null);
  const indicator = useRef(null);

  useGSAP(() => {
    if (!container.current) return;
    const translateFactor = tab;
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
    <div ref={container} className={`
    my-tabButton relative flex items-center w-full bg-tab-gray
    ${tabIcon1 ? 'rounded-[40px]' : 'rounded-[9px]'}`}>
      <button 
        onClick={() => {setTab(0); handleClick(0)}}
        className={`h-[2.7rem] flex justify-center items-center 
          ${tabIcon1 ? 'w-[3.5rem] pl-0.5' : 'w-full'}`}>
          {tab1 || tabIcon1}
        </button>

      <button 
        onClick={() => {setTab(1); handleClick(1)}}
        className={`h-[2.7rem] flex justify-center items-center
          ${tabIcon2 ? 'w-[3.5rem] pl-0.5' : 'w-full'}
        `}>
        {tab2 || tabIcon2}
      </button>
      <span ref={indicator} className={`
        my-tabIndicator absolute z-0 bottom-[3px] left-[3px] top-[3px] bg-myWhite
        ${tabIcon1 ? 'rounded-[40px]' : 'rounded-[6px]'}`} />
    </div>
  )
}