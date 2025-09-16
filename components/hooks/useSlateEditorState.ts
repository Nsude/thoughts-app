import { useEffect, useRef, useState } from "react";
import { BlockType } from "../rich-text-editor/slate";
import { Editor, Element, Range, Transforms } from "slate";
import {
  checkIsBlockEmpty,
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
    isEditorEmpty: true, // checks if the entire editor is empty
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

    const blockType = getCurrentBlockType(editor) as BlockType;
    const isEditorEmpty = editor.children.length === 0;
    const isSlashOnly = checkIsBlockSlashOnly(editor);
    const headingLevel =
      blockType === "heading" ? getCurrentHeadingLevel(editor) : 0;

    // Update current block state
    setCurrentBlock({
      type: blockType,
      isEditorEmpty,
      isSlashOnly,
      headingLevel,
    });

    // init isEmtpy state for placeholders 
    setPlaceholderState(prev => ({...prev, show: isEditorEmpty}));

    const { selection } = editor;
    if (!selection) return console.info("Slate selection does not exist");
    if (!Range.isCollapsed(selection)) return console.info("selection made");

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
      blockType,
      verticalPosition,
      isSlashOnly,
      headingLevel
    )
    
  }, [changed]);

  const handlePlaceholderState = (
    blockType: BlockType,
    verticalPosition: number,
    isSlashOnly: boolean,
    headingLevel: number
  ) => {
    if (!editor) return;
    const isBlockEmpty = checkIsBlockEmpty(editor);
    
    if ((isSlashOnly || isBlockEmpty) && blockType === "heading") {
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