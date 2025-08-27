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

interface Props {
  handleClick?: () => void;
  handleValueChange: (value: any[]) => void;
  thoughtId: Id<"thoughts">
}

// central state 
type EditorState = {
  status: "idle" | "loading" | "saving" | "error";
  lastSavedContent: any[] | null;
  isInitialised: boolean;
  isCreatingThought: boolean;
}

// all editor actions
type EditorAction = 
| {type: "INIT_CONTENT"}
| {type: "CONTENT_LOADED", content: any[]}
| {type: "CREATING_THOUGHT"}
| {type: "ERROR", msg: any};

const initialState:EditorState = {
  status: "idle",
  lastSavedContent: null,
  isInitialised: false,
  isCreatingThought: false
}

// central reducer
const editorReducer = (state: EditorState, action: EditorAction) => {
  switch(action.type) {
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
        lastSavedContent: action.content,
        isInitialised: true
      } as EditorState;
    case "ERROR": 
      return {
        ...state,
        status: 'error'
      } as EditorState;
  }
}

// function to get the length of the charactes on the page not counting spaces
const getContentLength = (content: any[]):number => {
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

export default function SlateEditor({ handleClick, handleValueChange, thoughtId }: Props) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // editor instance 
  const editor = useMemo(() => withHistory(withReact(createEditor())), []); 
  const initialValue: Descendant[] = useMemo(() => [{ type: "paragraph", children: [{ text: "" }]}], []);
  const router = useRouter();

  // convex mutations
  const createThought = useMutation(api.thoughts.createNewThought);
  const createDocument = useMutation(api.thoughts.createNewDocument);
  const setCoreThought = useMutation(api.thoughts.setCoreThought);

  const handleNewThought = useCallback(async (content: any[]) => {
    const contentLength = getContentLength(content);
    if (contentLength < 10) return;

    dispatch({type: "CREATING_THOUGHT"});

    try {
      const newThoughtId = await createThought({isPrivate: true});
      if (!newThoughtId) return;
      // create a document for the thought
      const coreThought = await createDocument({
        title: "Untitled Thought",
        thoughtFileId: newThoughtId,
        content
      })

      // init document as the core thought of the created thought
      await setCoreThought({coreThought: coreThought, thoughtId: newThoughtId});
      dispatch({type: "CONTENT_LOADED", content});
      router.replace(`/thoughts/${newThoughtId}`);
    } catch (error) {
      console.error("Error creating new thought: ", error);
      dispatch({type: "ERROR", msg: error});
    }
  }, [thoughtId, router])

  const handleSlateValueChange = useCallback(async (content: any[]) => {
    if (!content) return;

    handleValueChange(content); // call external value change

    if (state.isInitialised || state.isCreatingThought) return;

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
    <Slate key={thoughtId} editor={editor} initialValue={initialValue} onValueChange={handleSlateValueChange}>
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