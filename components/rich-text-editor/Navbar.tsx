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
import { useCallback, useEffect, useRef, useState } from "react";
import { CustomEditor } from "./CustomEditor";
import { useSlate } from "slate-react";
import { Editor, Element, Range, Text, Transforms } from "slate";
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
  const [disableIndButtons, setDisableIndButtons] = useState(false);


  // prevent menu when a heading Element is selected
  useEffect(() => {
    const { selection } = editor;

    if (!(selection && Range.isExpanded(selection))) return;

    const selectedBlocks = getSelectedBlocks(editor);
    const hasMultiBlockTypes = selectedBlocks.length > 1;

    if (!hasMultiBlockTypes) return setDisableIndButtons(false);

    setDisableIndButtons(true);

  }, [editor.selection])


  const getSelectedBlocks = (editor: Editor) => {
    const blocks = Array.from(Editor.nodes(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n)
    }))

    const blocksArray = Array.from(blocks.map(b => (b[0] as any).type));

    // remove duplicates
    return [...new Set(blocksArray)];
  }

  // close nav menu when block is empty
  useEffect(() => {
    const isBlockEmpty = (editor: Editor) => {
      const [block] = Editor.nodes(editor, {
        match: n => Element.isElement(n) && Editor.isBlock(editor, n),
        mode: "lowest"
      })

      if (!block) return true;

      const [textNode] = Editor.nodes(editor, {
        match: n => Text.isText(n), mode: "lowest"
      })

      if (!textNode) return true;

      const [text] = textNode;
      if (text.text.length === 0) return true;

      return false;
    }

    const isEmpty = isBlockEmpty(editor);
    if (isEmpty && display) setDisplay(false);
    
  }, [editor.selection])

  // handle selection
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
  const handleClose = useCallback(() => {
    setDisplay(false);
    setDisplayElemMenu(false);
    setManuallyHidden(true);
    // clear previous selection
    // i need this because after deselection the menu pops up again 
    // because it hasn't been deselected in slate
    Transforms.deselect(editor);
  }, [])

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
  const toggleElementsMenu = useCallback(() => {
    setDisplayElemMenu(prev => !prev);
  }, [])

  return (
    <div
      ref={mainRef}
      onMouseDown={(e) => e.preventDefault()} // stop browser from clearing selections when the navbar is clicked
      style={{ left: `${position.x || 300}px`, top: `${position.y}px` }}
      className="
      fixed z-10 -translate-x-1/5 bg-dark-gray p-1 rounded-[30px]
      flex gap-x-1.5 items-center border-2 border-border-gray
      opacity-0 pointer-events-none text-label-14
    ">
      <ElementsMenu
        display={displayElemMenu}
        navHeight={navHeight}
        variant={"navbar"}
        closeMenu={handleClose} />

      <NavMenuButton
        text="Refine"
        icon={<LogoIcon color="#fff" />}
        handleClick={() => console.log("refine clicked")} />

      <VerticalSlashIcon />

      <div className="my-nav-ind-button" data-disable={disableIndButtons}>
        <NavMenuButton
          text={selectedElem}
          icon={<DropdownIcon />}
          reverseRow={true}
          handleClick={toggleElementsMenu} />
      </div>

      <NavMenuButton
        icon={<BoldIcon />}
        handleClick={useCallback(() => CustomEditor.toggleBold(editor), [])} />

      <NavMenuButton
        icon={<ItalicIcon />}
        handleClick={useCallback(() => CustomEditor.toggleItalic(editor), [])} />

      <NavMenuButton
        icon={<UnderlineIcon />}
        handleClick={useCallback(() => CustomEditor.toggleUnderline(editor), [])} />

      <NavMenuButton
        icon={<LineThroughIcon />}
        handleClick={useCallback(() => { CustomEditor.toggleLineThrough(editor)}, [])} />

      <div className="my-nav-ind-button" data-disable={disableIndButtons}>
        <NavMenuButton
          icon={<CodeIcon />}
          handleClick={useCallback(() => {
            CustomEditor.toggleCode(editor);
            handleClose()
          }, [])} />
      </div>

      <div className="my-nav-ind-button" data-disable={disableIndButtons}>
        <NavMenuButton
          icon={<LinkIcon />}
          handleClick={() => console.log("make link")} />
      </div>

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