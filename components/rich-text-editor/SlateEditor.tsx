import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { createEditor, Descendant, Editor, Element, Transforms } from "slate"
import { withHistory } from "slate-history"
import { Editable, RenderElementProps, Slate, withReact } from "slate-react"
import { BulletListElement, CodeElement, DefaultElement, HeadingElement, ListItemElement, NumberedListElement } from "./CustomElements";
import { handleKeyDown } from "./CustomEditor";
import SlateNavbar from "./Navbar";
import InlineMenu from "./InlineMenu";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import { SlateStatusTypes, useSlateStatusContext } from "../contexts/SlateStatusContext";
import { BlockType } from "./slate";

interface Props {
  handleClick?: () => void;
  handleValueChange: (
    value: any[], 
    checkIsBlockSlashOnly: (editor: Editor) => boolean, 
    editor: Editor
  ) => void;
  thoughtId: Id<"thoughts">
  handleBlockTypeChange: (blockType: BlockType, isBlockEmpty: boolean, headingLevel?: number) => void;
}

// central state 
type EditorState = {
  status: SlateStatusTypes;
  isInitialised: boolean;
  isCreatingThought: boolean;
}

// all editor actions
type EditorAction =
  | { type: "INIT_CONTENT" }
  | { type: "CONTENT_LOADED" }
  | { type: "CREATING_THOUGHT" }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS" };

const initialState: EditorState = {
  status: "idle",
  isInitialised: false,
  isCreatingThought: false
}

// central reducer
const editorReducer = (state: EditorState, action: EditorAction) => {
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
      } as EditorState;
  }
}

// function to get the length of the charactes on the page not counting spaces
const getContentLength = (content: any[]): number => {
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
const getCurrentBlockType = (editor: Editor) => {
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
const getCurrentHeadingLevel = (editor: Editor) => {
  const [match] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && n.type === 'heading',
  });

  if (match) {
    const [node] = match;
    return Element.isElement(node) ? (node as any).level || 1 : 1;
  }
  return 0;
};

// check if the current block is empty
const checkIsCurrentBlockEmpty = (editor: Editor):boolean => {
  const [match] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n), 
    mode: "lowest"
  })
  
  if (!match) return false;

  const [node] = match;
  return Editor.isEmpty(editor, node as Element);
}

// check if the block only has a "/"
const checkIsBlockSlashOnly = (editor: Editor): boolean => {
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
  const textWithoutSpaces = blockText.replace(/\s/g, '');

  return textWithoutSpaces === '/';
};

// ==== MAIN EDITOR COMPONENT ====
export default function SlateEditor({ 
  handleClick, handleValueChange, thoughtId, handleBlockTypeChange }: Props) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // editor instance 
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue: Descendant[] = useMemo(() => [{ type: "paragraph", children: [{ text: "" }] }], []);
  const router = useRouter();

  // convex mutations and queries
  const createThought = useMutation(api.thoughts.createNewThought);
  const createDocument = useMutation(api.thoughts.createNewDocument);
  const setCoreThought = useMutation(api.thoughts.setCoreThought);
  const updateThought = useMutation(api.thoughts.updateThought);
  const thoughtWithDocument = useQuery(api.thoughts.getThoughtWithDocument, thoughtId !== "new" ? { thoughtId } : "skip");

  // compare content
  const hasContentChanged = useCallback((oldContent: any[], newContent: any[]) => {
    if (!oldContent) return true;
    return JSON.stringify(newContent) !== JSON.stringify(oldContent);
  }, [])

  const lastSavedContent = useRef<any[]>(null);
  const { setSlateStatus } = useSlateStatusContext();

  // ===== DISPLAY THE RIGHT DOCUMENT =====
  useEffect(() => {
    if (state.isInitialised) return;
    const document = thoughtWithDocument?.document;

    dispatch({ type: "INIT_CONTENT" });
    setSlateStatus("loading");

    if (thoughtId === "new") {
      editor.children = initialValue;
      Editor.normalize(editor);
      dispatch({ type: "CONTENT_LOADED" });
      lastSavedContent.current = initialValue;

    } else if (document?.content && thoughtId !== "new") {
      handleValueChange(document.content, checkIsBlockSlashOnly, editor);
      editor.children = document.content;
      Editor.normalize(editor);

      dispatch({ type: "CONTENT_LOADED" });
      lastSavedContent.current = document.content;
    }

    setSlateStatus("idle");
  }, [thoughtId, thoughtWithDocument?.document?.content])

  // ===== AUTO SAVE =====
  const debounceAutosave = useMemo(() => {
    return debounce(async (content: any[]) => {
      const document = thoughtWithDocument?.document;
      if (!document || !lastSavedContent.current) return;

      if (!hasContentChanged(lastSavedContent.current, content)) return;

      dispatch({ type: "SAVE_START" });
      setSlateStatus("saving");

      try {
        await updateThought({
          newContent: content,
          documentId: document._id,
          thoughtId
        })

        dispatch({ type: "SAVE_SUCCESS" });
        setSlateStatus("saved");
        lastSavedContent.current = content;
      } catch (error) {
        console.error("Error saving content: ", error);
      }

    }, 3000)
  }, [thoughtId, thoughtWithDocument?.document?._id, hasContentChanged])

  // ===== CREATE A NEW THOUGHT =====
  const handleNewThought = useCallback(async (content: any[]) => {
    const contentLength = getContentLength(content);
    if (contentLength < 10) return;

    dispatch({ type: "CREATING_THOUGHT" });
    setSlateStatus("saving");

    try {
      const newThoughtId = await createThought({ isPrivate: true });
      if (!newThoughtId) return;
      // create a document for the thought
      const coreThought = await createDocument({
        title: "Untitled Thought",
        thoughtFileId: newThoughtId,
        content
      })

      // init document as the core thought of the created thought
      await setCoreThought({ coreThought: coreThought, thoughtId: newThoughtId });
      dispatch({ type: "CONTENT_LOADED" });

      // update last saved ref
      lastSavedContent.current = content;
      router.replace(`/thoughts/${newThoughtId}`);
      setSlateStatus("saved");
    } catch (error) {
      console.error("Error creating new thought: ", error);
      setSlateStatus("error");
    }
  }, [thoughtId, router])

  // ===== HANDLE VALUE CHANGE =====
  const handleSlateValueChange = useCallback(async (content: any[]) => {
    if (!content) return;

    handleValueChange(content, checkIsBlockSlashOnly, editor); // call external value change

    if (thoughtId !== "new" && state.isInitialised) {
      await debounceAutosave(content);
    }

    if (state.isCreatingThought) return;

    if (thoughtId === "new") {
      await handleNewThought(content);
    }


  }, [handleValueChange, handleNewThought, thoughtId, state.isInitialised, state.isCreatingThought])

  // render the selected element type
  const renderElement = useCallback((props: RenderElementProps) => {
    const { element } = props;

    switch (element.type) {
      case "code":
        return <CodeElement {...props} />
      case "heading":
        return <HeadingElement {...props} />
      case "bullet-list":
        return <BulletListElement {...props} />
      case "numbered-list":
        return <NumberedListElement {...props} />
      case "list-item":
        return <ListItemElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  // apply styles to selected characters
  const renderLeaf = (props: any) => {
    const leaf = props.leaf;
    return (
      <span {...props.attributes}
        style={{
          fontWeight: leaf.bold ? '800' : 'normal',
          backgroundColor: leaf.highlight ? "#FE7A33" : "unset",
          fontStyle: leaf.italic ? "italic" : "normal",
          textDecoration: leaf.underline ? "underline" :
            leaf.linethrough ? "line-through" : "unset",
        }}
      >
        {props.children}
      </span>
    )
  }

  return (
    <Slate 
      key={thoughtId} 
      editor={editor} 
      initialValue={initialValue} 
      onValueChange={(e) => {
        handleSlateValueChange(e); 
        const blockType = getCurrentBlockType(editor);
        const headingLevel = blockType === 'heading' ? getCurrentHeadingLevel(editor) : undefined;
        handleBlockTypeChange(blockType as BlockType, checkIsBlockSlashOnly(editor), headingLevel);
      }}>
      <SlateNavbar />
      <InlineMenu />

      <Editable
        className="focus:outline-none"
        onClick={handleClick}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(e) => handleKeyDown(e, editor)}
      />
    </Slate>
  )
}