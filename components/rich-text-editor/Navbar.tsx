"use client";

import LogoIcon from "@/public/icons/LogoIcon";
import NavMenuButton from "../buttons/NavmenuButton";
import VerticalSlashIcon from "@/public/icons/VerticalSlashIcon";
import DropdownIcon from "@/public/icons/DropdownIcon";
import BoldIcon from "@/public/icons/BoldIcon";
import ItalicIcon from "@/public/icons/ItalicIcon";
import UnderlineIcon from "@/public/icons/UnderlineIcon";
import LineThroughIcon from "@/public/icons/LineThroughIcon";
import CodeIcon from "@/public/icons/CodeIcon";
import LinkIcon from "@/public/icons/LinkIcon";
import ColorIcon from "@/public/icons/ColorIcon";
import CloseIcon from "@/public/icons/CloseIcon";
import { useEffect, useRef, useState } from "react";
import { CustomEditor } from "./CustomEditor";
import { useSlate } from "slate-react";
import { Editor, Range, Transforms } from "slate";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ElementsMenu from "./ElementsMenu";

export default function SlateNavbar() {
  const [selectedElem, setSelectedElem] = useState("Text");
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const editor = useSlate();
  const mainRef = useRef(null)
  const [display, setDisplay] = useState(false);
  const [manuallyHidden, setManuallyHidden] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    if (!mainRef.current) return;
    const navbar = mainRef.current as HTMLDivElement;

    // Don't show menu if it was manually hidden
    if (manuallyHidden || display) return;

    const domSelection = document.getSelection();

    if (domSelection && !domSelection.isCollapsed) {
      const { left, top } = domSelection.getRangeAt(0).getBoundingClientRect();
      const { height: navHeight } = navbar.getBoundingClientRect();
      setNavHeight(navHeight);
      setPosition({ x: left, y: top - (navHeight + 10) });

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        setDisplay(true);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [editor.selection, manuallyHidden]);

  // Reset manuallyHidden when selection actually changes (new selection made)
  useEffect(() => {
    const domSelection = document.getSelection();
    if (domSelection && !domSelection.isCollapsed && !display) {
      setManuallyHidden(false);
    }
  }, [editor.selection, display]);

  // handleClose
  const handleClose = () => {
    setDisplay(false);
    setDisplayElemMenu(false);
    setManuallyHidden(true);
    // clear previous selection
    Transforms.deselect(editor);
  }

  // handle clicks outside the navbar
  useEffect(() => {
    if (!mainRef.current) return;
    const navbar = mainRef.current as HTMLDivElement;

    const handleMouseDown = (e: MouseEvent) => {
      if (display && !navbar.contains(e.target as Node)) {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);

    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [display])


  // display and hide navbar
  useGSAP(() => {
    if (!mainRef.current) return;
    const navbar = mainRef.current as HTMLDivElement;

    console.log("triggered")

    if (display) {
      gsap.set(navbar, { pointerEvents: "all" });

      gsap.to(navbar, {
        opacity: 1,
        duration: .2,
      })
    } else {
      gsap.set(navbar, { pointerEvents: "none" });

      gsap.to(navbar, {
        opacity: 0,
        duration: .2
      })
    }

  }, { scope: mainRef, dependencies: [display] })

  const [displayElemMenu, setDisplayElemMenu] = useState(false);
  const toggleElementsMenu = () => {
    setDisplayElemMenu(prev => !prev);
  }

  return (
    <div
      ref={mainRef}
      onMouseDown={(e) => e.preventDefault()} // stop browser from clearing selections when the navbar is clicked
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="
      fixed z-10 -translate-x-1/5 bg-dark-gray p-1 rounded-[30px]
      flex gap-x-1.5 items-center border-2 border-border-gray
      opacity-0 pointer-events-none text-label-14
    ">
      <ElementsMenu 
        display={displayElemMenu} 
        navHeight={navHeight}
        closeMenu={handleClose} />

      <NavMenuButton
        text="Refine"
        icon={<LogoIcon color="#fff" />}
        handleClick={() => console.log("refine clicked")} />

      <VerticalSlashIcon />

      <NavMenuButton
        text={selectedElem}
        icon={<DropdownIcon />}
        reverseRow={true}
        handleClick={toggleElementsMenu} />

      <NavMenuButton
        icon={<BoldIcon />}
        handleClick={() => CustomEditor.toggleBold(editor)} />

      <NavMenuButton
        icon={<ItalicIcon />}
        handleClick={() => CustomEditor.toggleItalic(editor)} />

      <NavMenuButton
        icon={<UnderlineIcon />}
        handleClick={() => CustomEditor.toggleUnderline(editor)} />

      <NavMenuButton
        icon={<LineThroughIcon />}
        handleClick={() => {CustomEditor.toggleLineThrough(editor)}} />

      <NavMenuButton
        icon={<CodeIcon />}
        handleClick={() => {
          CustomEditor.toggleCode(editor); 
          handleClose()
        }} />

      <NavMenuButton
        icon={<LinkIcon />}
        handleClick={() => console.log("make link")} />

      <NavMenuButton
        icon={<ColorIcon />}
        handleClick={() => console.log("color")} />

      <VerticalSlashIcon />

      <NavMenuButton
        icon={<CloseIcon />}
        handleClick={handleClose} />
    </div>
  )
}