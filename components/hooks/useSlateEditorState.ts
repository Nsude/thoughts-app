import { useEffect, useRef, useState } from "react";
import { BlockType } from "../rich-text-editor/slate";
import { Editor, Range } from "slate";
import {
  checkIsBlockSlashOnly,
  getCurrentBlockType,
  getCurrentHeadingLevel,
} from "../rich-text-editor/slateEditorFunctions";
import { ReactEditor } from "slate-react";

// ✅ Centralized editor state management
export const useSlateEditorState = () => {
  const [changed, setChanged] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [currentBlock, setCurrentBlock] = useState({
    type: "paragraph" as BlockType,
    isEmpty: true, // checks if the entire editor is empty
    isSlashOnly: false,
    headingLevel: 0,
  });
  const [placeholderState, setPlaceholderState] = useState({
    show: true,
    type: "default" as "default" | "heading",
    headingLevel: 0,
    position: 0,
  });

  useEffect(() => {
    if (!editor) return;
    console.log("slate hook editor updated ✅✅")

    const blockType = getCurrentBlockType(editor) as BlockType;
    const isEmpty = editor.children.length === 0;
    const isSlashOnly = checkIsBlockSlashOnly(editor);
    const headingLevel =
      blockType === "heading" ? getCurrentHeadingLevel(editor) : 0;

    // Update current block state
    setCurrentBlock({
      type: blockType,
      isEmpty,
      isSlashOnly,
      headingLevel,
    });

    // initi isEmtpy state for placeholders 
    setPlaceholderState(prev => ({...prev, show: isEmpty}));

    const { selection } = editor;
    if (!selection) return console.log("Slate selection does not exist");
    if (!Range.isCollapsed(selection)) return console.log("selection made");

    // Get vertical position of cursor using ReactEditor
    let verticalPosition = 0;
    try {
      // Get the DOM range for the current selection
      const domRange = ReactEditor.toDOMRange(editor, selection);
      const {top} = domRange.getBoundingClientRect();
      verticalPosition = top;
    } catch (error) {
      console.error("Could not get cursor position:", error);
    }

    // set the right placeholder state
    handlePlaceholderState(
      isEmpty,
      blockType,
      verticalPosition,
      isSlashOnly,
      headingLevel
    )
    
  }, [changed]);

  const handlePlaceholderState = (
    isEmpty: boolean,
    blockType: BlockType,
    verticalPosition: number,
    isSlashOnly: boolean,
    headingLevel: number
  ) => {
    if (isEmpty && blockType !== "heading") {
      setPlaceholderState({
        show: true,
        type: "default",
        headingLevel: 0,
        position: verticalPosition,
      });
    } else if (isSlashOnly && blockType === "heading") {
      setPlaceholderState({
        show: true,
        type: "heading",
        headingLevel: headingLevel,
        position: verticalPosition,
      });
    } else {
      setPlaceholderState((prev) => ({ ...prev, show: false }));
    }
  }

  return {
    placeholderState,
    currentBlock,
    setEditor,
    setChanged
  };
};