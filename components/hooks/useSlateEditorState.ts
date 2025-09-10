import { useEffect, useState } from "react";
import { BlockType } from "../rich-text-editor/slate";
import { Id } from "@/convex/_generated/dataModel";

// ✅ Centralized editor state management
export const useSlateEditorState = (thoughtId: Id<"thoughts">) => {
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
  });

  // Derive placeholder state from current block
  useEffect(() => {
    if (currentBlock.isEmpty && currentBlock.type === "paragraph") {
      setPlaceholderState({ show: true, type: "default", headingLevel: 0 });
    } else if (currentBlock.isSlashOnly && currentBlock.type === "heading") {
      setPlaceholderState({
        show: true,
        type: "heading",
        headingLevel: currentBlock.headingLevel,
      });
    } else {
      setPlaceholderState({ show: false, type: "default", headingLevel: 0 });
    }
  }, [currentBlock]);

  return {
    currentBlock,
    setCurrentBlock,
    placeholderState,
  };
};