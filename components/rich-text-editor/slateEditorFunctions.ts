import { Editor, Element } from "slate";
import { EditorAction, EditorState } from "../app.models";

// function to get the length of the charactes on the page not counting spaces
export const getContentLength = (content: any[]): number => {
  if (!content || content.length === 0) return 0;

  return content.reduce((total, node) => {
    if (node.children) {
      return total + (node.children as any[]).reduce((nodeTotal, child) => {
        return nodeTotal + (child.text?.trim().length || 0)
      }, 0)
    }
    return total;
  }, 0)
}

// function to get current block type
export const getCurrentBlockType = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
  });

  if (match) {
    const [node] = match;
    return Element.isElement(node) ? node.type : 'paragraph';
  }
  return 'paragraph';
};

// function to get heading level
export const getCurrentHeadingLevel = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && n.type === 'heading',
  });

  if (match) {
    const [node] = match;
    return Element.isElement(node) ? (node as any).level || 1 : 1;
  }
  return 0;
};

// check if the block only has a "/"
export const checkIsBlockSlashOnly = (editor: Editor): boolean => {
  if (!editor.selection) return false;

  // Get current block
  const [match] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    mode: "lowest"
  });

  if (!match) return false;

  const [, path] = match;

  // Get the text content of the current block
  const blockText = Editor.string(editor, Editor.range(editor, path));

  // Remove all spaces and check if only "/" remains
  const textWithoutSpaces = blockText.trim();

  return textWithoutSpaces === '/';
};

// check if current block is empty 
export const checkIsBlockEmpty = (editor: Editor): boolean => {
  if (!editor.selection) return true;

  // Get current block
  const [match] = Editor.nodes(editor, {
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
    mode: "lowest",
  });

  if (!match) return true;

  const [, path] = match;

  // Get the text content of the current block
  const blockText = Editor.string(editor, Editor.range(editor, path));

  return blockText.toLowerCase().trim() === "";
};


// central reducer
export const editorReducer = (state: EditorState, action: EditorAction) => {
  switch (action.type) {
    case "INIT_CONTENT":
      return {
        ...state,
        status: "loading",
        isInitialised: false
      } as EditorState;
    case "CREATING_THOUGHT":
      return {
        ...state,
        isCreatingThought: true,
        isInitialised: false,
        status: "saving"
      } as EditorState
    case "CONTENT_LOADED":
      return {
        ...state,
        status: "idle",
        isInitialised: true,
        hasUnsavedContent: false
      } as EditorState;
    case "SAVE_START":
      return {
        ...state,
        status: "saving"
      } as EditorState;
    case "SAVE_SUCCESS":
      return {
        ...state,
        status: "idle",
        hasUnsavedContent: false
      } as EditorState;
    case "UNSAVED_CONTENT":
      return {
        ...state,
        hasUnsavedContent: true
      } as EditorState;
  }
}