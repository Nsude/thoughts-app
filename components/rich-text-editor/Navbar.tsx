"use client";

import LogoIcon from "@/public/icons/LogoIcon";
import NavMenuButton from "../buttons/NavmenuButton";
import VerticalSlashIcon from "@/public/icons/VerticalSlashIcon";
import DefaultIcon from "@/public/icons/DefaultIcon";
import DropdownIcon from "@/public/icons/DropdownIcon";
import BoldIcon from "@/public/icons/BoldIcon";
import ItalicIcon from "@/public/icons/ItalicIcon";
import UnderlineIcon from "@/public/icons/UnderlineIcon";
import LineThroughIcon from "@/public/icons/LineThrougIcon";
import CodeIcon from "@/public/icons/CodeIcon";
import LinkIcon from "@/public/icons/LinkIcon";
import ColorIcon from "@/public/icons/ColorIcon";
import CloseIcon from "@/public/icons/CloseIcon";
import { useEffect, useRef, useState } from "react";
import { CustomEditor } from "./CustomEditor";
import { useSlate } from "slate-react";
import { Range } from "slate";
import { useGSAP } from "@gsap/react";

export default function SlateNavbar() {
  const [selectedElem, setSelectedElem] = useState("Text");
  const [position, setPosition] = useState({x: 0, y: 0})
  const editor = useSlate();
  const mainRef = useRef(null)
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (!mainRef.current) return;
    const navbar = mainRef.current as HTMLDivElement;

    const {selection} = editor;

    if (selection && Range.isExpanded(selection)) {
      // get DOM selection 
      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        // get the latest selection
        const currentSelection = domSelection.getRangeAt(0);
        const selectionRect = currentSelection.getBoundingClientRect();

        if (!selectionRect) return console.info("No selection has been made");
        const {width, left, top} = selectionRect;
        const {height: navHeight} = navbar.getBoundingClientRect();


        setPosition({
          x: left, // center horizontally
          y: top - (navHeight + 10)
        });
      }

      
    }
    
  }, [editor.selection])


  // display and hide navbar
  useGSAP(() => {

  }, {scope: mainRef, dependencies: [display]})

  const toggleElementsMenu = () => {

  }

  return (
    <div
      ref={mainRef}
      style={{left: `${position.x}px`, top: `${position.y}px`}}
      className="
      fixed z-10 -translate-x-1/5 bg-dark-gray p-1 rounded-[30px]
      flex gap-x-1.5 items-center border-2 border-border-gray
    ">
      <NavMenuButton 
        text="Refine" 
        icon={<LogoIcon color="#fff" />} 
        handleClick={() => console.log("refine clicked")} />

      <VerticalSlashIcon />

      <div>
        <NavMenuButton 
          text={selectedElem} 
          icon={<DropdownIcon />} 
          reverseRow={true} 
          handleClick={toggleElementsMenu} />
      </div>
      
      <NavMenuButton 
        icon={<BoldIcon />} 
        handleClick={() => CustomEditor.toggleBold(editor)} />
      
      <NavMenuButton 
        icon={<ItalicIcon />} 
        handleClick={() => CustomEditor.toggleItalic(editor)}/>

      <NavMenuButton 
        icon={<UnderlineIcon />} 
        handleClick={() => CustomEditor.toggleUnderline(editor)} />

      <NavMenuButton 
        icon={<LineThroughIcon />} 
        handleClick={() => CustomEditor.toggleLineThroug(editor)} />

      <NavMenuButton 
        icon={<CodeIcon />} 
        handleClick={() => CustomEditor.toggleCode(editor)} />

      <NavMenuButton 
        icon={<LinkIcon />} 
        handleClick={() => console.log("make link") } />

      <NavMenuButton 
        icon={<ColorIcon />} 
        handleClick={() => console.log("color")} />

      <VerticalSlashIcon />

      <NavMenuButton 
        icon={<CloseIcon />} 
        handleClick={() => console.log("close")} />
    </div>
  )
}