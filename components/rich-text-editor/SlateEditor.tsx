import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { createEditor, Descendant, Transforms } from "slate"
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
import { debounce, flatMap } from "lodash";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";
import { BlockType } from "./slate";
import { 
  checkIsBlockSlashOnly, 
  editorReducer, 
  getContentLength, 
  getCurrentBlockType, 
  getCurrentHeadingLevel } from "./slateEditorFunctions";
import { EditorState } from "../app.models";

// ==== MAIN EDITOR COMPONENT ====
// central editor state 
const initialState: EditorState = {
  status: "idle",
  isInitialised: false,
  isCreatingThought: false,
  hasUnsavedContent: false
}
interface Props {
  handleClick?: () => void;
  thoughtId: Id<"thoughts">;
  onChange: (state: {
    blockType: BlockType,
    isEmpty: boolean,
    isSlashOnly: boolean,
    headingLevel?: number
  }) => void;
}

export default function SlateEditor({ 
  handleClick, onChange, thoughtId }: Props) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // editor instance 
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue: Descendant[] = useMemo(() => [{ type: "paragraph", children: [{ text: "" }] }], []);
  const router = useRouter();

  // ===== CONVEX MUTATIONS =====
  const createThought = useMutation(api.thoughts.createThought);
  const createVersion = useMutation(api.thoughts.createVersion);
  const updateThought = useMutation(api.thoughts.updateThought);
  const setSelectedVersion = useMutation(api.thoughts.setSelectedVersion);

  // ===== CONVEX QUERIES =====
  const selectedVersion = useQuery(
    api.thoughts.getSelectedVersion, 
    thoughtId !== "new" ? { thoughtId } : "skip"
  );

  // compare content
  const hasContentChanged = useCallback((oldContent: any[], newContent: any[]) => {
    if (!oldContent) return true;
    return JSON.stringify(newContent) !== JSON.stringify(oldContent);
  }, [])

  const lastSavedContent = useRef<any[]>([]);
  const { 
    slateStatus, 
    setSlateStatus, 
    setCurrentContent, 
    setIsSourceAudio, 
    isSourceAudio,
    currentContent,
    versionSwitched, 
    setVersionSwitched
  } = useSlateStatusContext();

  // ===== DISPLAY THE SELECTED VERSION CONTENT ON FIRST LOAD =====
  useEffect(() => {
    if (state.isInitialised) return;
    const selectedContent = selectedVersion?.content;

    dispatch({ type: "INIT_CONTENT" });
    setSlateStatus("loading");

    if (thoughtId === "new") {
      editor.children = initialValue;
      dispatch({ type: "CONTENT_LOADED" });
      lastSavedContent.current = initialValue;

    } else if (selectedContent && thoughtId !== "new") {
      editor.children = selectedContent;
      // notify the placeholder state that the editor isn't empty
      handleSlateValueChange(selectedContent); 

      dispatch({ type: "CONTENT_LOADED" });
      lastSavedContent.current = selectedContent;
    }

    setSlateStatus("idle");
  }, [thoughtId, selectedVersion?.content])

  // UPDATE THE DISPLAYED CONTENT ON VERSION SWITCH;
  useEffect(() => {
    if (!state.isInitialised || !selectedVersion) return;
    const selectedContent = selectedVersion.content;

    editor.children = selectedContent;
    handleSlateValueChange(selectedContent);

  }, [selectedVersion?._id])

  // ===== AUTO SAVE =====
  const debounceAutosave = useMemo(() => {
    return debounce(async (content: any[]) => {
      if (lastSavedContent.current.length === 0) return;

      if (
        !hasContentChanged(lastSavedContent.current, content) || 
        slateStatus !== "idle"
      ) return;

      dispatch({ type: "SAVE_START" });
      setSlateStatus("saving");

      try {
        await updateThought({
          newContent: content,
          thoughtId
        })

        dispatch({ type: "SAVE_SUCCESS" });
        setSlateStatus("saved");
        lastSavedContent.current = content;
      } catch (error) {
        console.error("Error saving content: ", error);
      }

    }, 2000)
  }, [thoughtId, selectedVersion?._id, hasContentChanged])

  // ===== CREATE A NEW THOUGHT =====
  const handleCreateThought = useCallback(async (content: any[]) => {
    const contentLength = getContentLength(content);
    if (contentLength < 10) return;

    dispatch({ type: "CREATING_THOUGHT" });
    setSlateStatus("saving");

    try {
      const newThoughtId = await createThought({ isPrivate: true });
      if (!newThoughtId) return;

      // create the core version for the thought
      const versionId = await createVersion({
        thoughtId: newThoughtId,
        content,
        versionNumber: 1,
        isCore: true,
        createdAt: Date.now()
      })

      if (!versionId) return;

      // set the selected version to the only version as it stands
      await setSelectedVersion({
        thoughtId: newThoughtId,
        selectedVersion: versionId
      })

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
    
    setIsSourceAudio(false);
    setCurrentContent(content)
    
    
    // set states for useSlateEditorState hook
    const blockType = getCurrentBlockType(editor);
    const isEmpty = editor.children.length === 0;
    const isSlashOnly = checkIsBlockSlashOnly(editor);
    const headingLevel = blockType === 'heading' ? getCurrentHeadingLevel(editor) : 0;
    
    // call external on change
    onChange({
      blockType: blockType as BlockType,
      isEmpty,
      isSlashOnly,
      headingLevel
    });
    
    // prevent handle change from running when a user switches versions
    if (versionSwitched) return setVersionSwitched(false);

    // notify unsaved changes
    if (state.isInitialised) {
      dispatch({type: "UNSAVED_CONTENT"});
      setSlateStatus("unsaved_change");
    };

    if (thoughtId !== "new" && state.isInitialised) {
      await debounceAutosave(content);
    }

    if (state.isCreatingThought) return;

    if (thoughtId === "new") {
      await handleCreateThought(content);
    }


  }, [onChange, handleCreateThought, thoughtId, state.isInitialised, state.isCreatingThought])

  useEffect(() => {

  }, [currentContent])

  // display content on editor after recording in transcribed 
  useEffect(() => {
    if (
      currentContent.length === 0 || 
      !hasContentChanged(editor.children, currentContent) ||
      !isSourceAudio
    ) return;

    // update the editor 
    Transforms.insertNodes(editor, currentContent, {at: [editor.children.length]});
    setIsSourceAudio(false);
    console.info("updated editor ✅")
  }, [currentContent])

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
      onValueChange={handleSlateValueChange}>
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