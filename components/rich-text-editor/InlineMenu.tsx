"use client";

import { useEffect, useRef, useState } from "react";
import { Editor, Element, Range, Text } from "slate";
import { useSlate } from "slate-react";
import ElementsMenu from "./ElementsMenu";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { getCurrentHeadingLevel } from "./slateEditorFunctions";

export default function InlineMenu() {
  const editor = useSlate();
  const mainRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [position, setPosition] = useState({x: 0, y: 0});

  // set the caret (cursor) position 
  useEffect(() => {
    if (openMenu) return;
    
    const domSelection = document.getSelection();
    if (!domSelection || domSelection.rangeCount < 1) return;

    // get selection rect
    const {left, top} = domSelection.getRangeAt(0).getBoundingClientRect();
    const headingLevel = getCurrentHeadingLevel(editor);

    setPosition({
      x: left - 10, 
      y: headingLevel === 0 ? top + 25 : 
        headingLevel === 1 ? top + 50 :
        headingLevel === 2 ? top + 45 :  
        top + 38
      });

  }, [editor.selection])

  // clear menu when block is empty
  useEffect(() => {
    if (!openMenu) return;

    const {selection} = editor;
    if (!selection || Range.isExpanded(selection)) return;

    const {offset} = selection.anchor;
    if (offset === 0) setOpenMenu(false);

  }, [editor.selection]);


  // check if the "/" is on its own
  const isSlashIndependent = ():boolean => {
    const {selection} = editor;
    if (!selection || Range.isExpanded(selection)) return false

    const [currentBlock] = Editor.nodes(editor, {
      match: n => Element.isElement(n) && Editor.isBlock(editor, n) && n.type !== "code",
      mode: "lowest"
    }) 

    if (!currentBlock) return false;

    const [textNode] = Editor.nodes(editor, {
      match: n => Text.isText(n), mode: "lowest"
    });

    if (!textNode) return false;

    const [text] = textNode;
    const {offset: currentPosition} = selection.anchor;

    const charBefore = currentPosition > 0 ? text.text[currentPosition - 1] : null;
    const charAfter = currentPosition < text.text.length ? text.text[currentPosition] : null

    // Independent if:
    // - No character before OR character before is whitespace
    // - No character after OR character after is whitespace
    const isIndependent =
      (!charBefore || /\s/.test(charBefore)) &&
      (!charAfter || /\s/.test(charAfter));

    return isIndependent;
  }

  // keydown interactions
  useEffect(() => {
    const handleSlashPressed = (e: KeyboardEvent) => {
      const {key} = e;
      const isIndependent = isSlashIndependent();

      switch(key.toLowerCase()) {
        case "/":
          if (!isIndependent) return;
          setOpenMenu(true);
          break;
        case "backspace":
          setOpenMenu(false);
          break;
        case "escape":
          setOpenMenu(false);
          break
        default:
          if (!isIndependent) setOpenMenu(false);
          break;
      }
      
    }

    document.addEventListener("keydown", handleSlashPressed);
  }, []);


  // hide/display inline menu
  useGSAP(() => {
    if (!mainRef.current) return;
    const main = mainRef.current as HTMLDivElement;

    if (openMenu) {
      gsap.set(main, { pointerEvents: "all" });

      gsap.to(main, {
        opacity: 1,
        duration: 0
      })
    } else {
      gsap.set(main, { pointerEvents: "none" });

      gsap.to(main, {
        opacity: 0,
        duration: 0
      })
    }

  }, { scope: mainRef, dependencies: [openMenu] })

  return (
    <div 
      ref={mainRef}
      onMouseDown={(e) => e.preventDefault()}
      style={{left: position.x + "px", top: position.y + "px"}}
      className="fixed z-10">
      <ElementsMenu 
        display={openMenu} 
        closeMenu={() => setOpenMenu(false)} 
        variant="extended" />
    </div>
  )
}