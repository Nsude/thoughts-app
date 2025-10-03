/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { createEditor, Editor, Transforms } from "slate";
import { withHistory } from "slate-history";
import { Editable, RenderElementProps, Slate, withReact } from "slate-react";
import {
  BulletListElement,
  CodeElement,
  DefaultElement,
  HeadingElement,
  ListItemElement,
  NumberedListElement,
} from "./CustomElements";
import { handleKeyDown } from "./CustomEditor";
import SlateNavbar from "./Navbar";
import InlineMenu from "./InlineMenu";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import { useSlateStatusContext } from "../contexts/SlateStatusContext";
import { editorReducer, getContentLength } from "./slateEditorFunctions";
import { EditorState } from "../app.models";

// ==== MAIN EDITOR COMPONENT ====
// central editor state
const initialState: EditorState = {
  status: "idle",
  isInitialised: false,
  isCreatingThought: false,
  hasUnsavedContent: false,
};
interface Props {
  handleClick?: () => void;
  thoughtId: Id<"thoughts">;
  onChange: (editor: Editor) => void;
}

export default function SlateEditor({ handleClick, onChange, thoughtId }: Props) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // editor instance
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue: any[] = useMemo(() => [{ type: "paragraph", children: [{ text: "" }] }], []);
  const router = useRouter();

  // Real-time collaboration flags
  const isApplyingRemoteChange = useRef(false);
  // last content we got from the server (version content)
  const lastRemoteContent = useRef<any[]>([]);
  // last content confirmed saved on server
  const lastSavedContent = useRef<any[]>([]);
  // snapshot of content that was sent in a pending save
  const pendingSaveSnapshot = useRef<any[] | null>(null);
  // pending saves count (simple concurrency guard)
  const pendingSaves = useRef(0);

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

  // derived slate status/context
  const {
    slateStatus,
    setSlateStatus,
    setCurrentContent,
    setAllowContent,
    allowContent,
    currentContent,
    versionSwitched,
    setVersionSwitched,
  } = useSlateStatusContext();

  // compare content helper
  const hasContentChanged = useCallback((oldContent: any[] | undefined | null, newContent: any[] | undefined | null) => {
    if (!oldContent) return true;
    return JSON.stringify(newContent) !== JSON.stringify(oldContent);
  }, []);

  // ===== AUTO-SAVE (optimistic) =====
  // Debounced save function -- sends the current optimistic content snapshot to server.
  // We record the snapshot in pendingSaveSnapshot so we can later match a server ack to it.
  const saveContent = useMemo(() => {
    const fn = debounce(async (content: any[]) => {
      // If we're applying a remote change, don't start a save from that change
      if (isApplyingRemoteChange.current) return;
      if (lastSavedContent.current.length === 0) {
        // Avoid attempting to save if nothing has been initialised yet.
        return;
      }

      // If content hasn't changed compared to lastSavedContent, nothing to do
      if (!hasContentChanged(lastSavedContent.current, content) || slateStatus !== "idle" && slateStatus !== "unsaved_change") {
        return;
      }

      // Mark this save as pending
      pendingSaves.current += 1;
      pendingSaveSnapshot.current = JSON.parse(JSON.stringify(content)); // deep clone snapshot
      dispatch({ type: "SAVE_START" });
      setSlateStatus("saving");

      try {
        await updateThought({
          newContent: content,
          thoughtId,
        });

        // Save acknowledged by server
        pendingSaves.current = Math.max(0, pendingSaves.current - 1);

        // Update lastSavedContent only if the server acks — we assume ack means server now has `content`.
        // This keeps optimistic editor content intact for the user while confirming server state.
        lastSavedContent.current = pendingSaveSnapshot.current ?? content;
        pendingSaveSnapshot.current = null;

        dispatch({ type: "SAVE_SUCCESS" });
        setSlateStatus("saved");

      } catch (error) {
        pendingSaves.current = Math.max(0, pendingSaves.current - 1);
        pendingSaveSnapshot.current = null;
        console.error("Error saving content: ", error);
        setSlateStatus("error");
      }
    }, 550); // debounced for near-real-time saves

    return fn;
  }, [thoughtId, selectedVersion?._id, hasContentChanged, state.isInitialised, state.hasUnsavedContent]);

  // ===== CREATE A NEW THOUGHT (keeps original behaviour) =====
  const createThoughtTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleCreateThought = useCallback(async (content: any[]) => {
    if (createThoughtTimeout.current) clearTimeout(createThoughtTimeout.current);

    createThoughtTimeout.current = setTimeout(async () => {
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
          createdAt: Date.now(),
        });

        if (!versionId) return;

        // set the selected version to the only version as it stands
        await setSelectedVersion({
          thoughtId: newThoughtId,
          selectedVersion: versionId,
        });

        // update last saved ref
        lastSavedContent.current = content;
        router.replace(`/thoughts/${newThoughtId}`);
        setSlateStatus("saved");
      } catch (error) {
        console.error("Error creating new thought: ", error);
        setSlateStatus("error");
      }
    }, 2000);
  }, [thoughtId, router]);

  // ===== HANDLE VALUE CHANGE (optimistic) =====
  const handleSlateValueChange = useCallback(
    async (value: any[]) => {
      // `value` is the editor's optimistic content (what the user currently sees/typed)
      if (!value || isApplyingRemoteChange.current) return;

      // set local optimistic state in context
      setAllowContent(false);
      setCurrentContent(value);

      // call external onChange for placeholder handling
      onChange(editor);

      // if the user just switched versions, short-circuit the autosave for the switch moment
      if (versionSwitched) return setVersionSwitched(false);

      // notify unsaved changes
      if (state.isInitialised) {
        dispatch({ type: "UNSAVED_CONTENT" });
        setSlateStatus("unsaved_change");
      }

      // schedule a debounced save (optimistic)
      if (thoughtId !== "new" && state.isInitialised) {
        saveContent(value);
      }

      // if we're creating a new thought from the editor
      if (state.isCreatingThought) return;
      if (thoughtId === "new") {
        await handleCreateThought(value);
      }
    },
    [onChange, handleCreateThought, thoughtId, state.isInitialised, state.isCreatingThought, saveContent]
  );

  // ===== INITIAL LOAD: render the selected version to the editor but keep it optimistic =====
  useEffect(() => {
    if (state.isInitialised) return;
    const selectedContent = selectedVersion?.content;

    dispatch({ type: "INIT_CONTENT" });
    setSlateStatus("loading");

    if (thoughtId === "new") {
      editor.children = initialValue;
      dispatch({ type: "CONTENT_LOADED" });
      lastSavedContent.current = initialValue;
      lastRemoteContent.current = initialValue;
    } else if (selectedContent && thoughtId !== "new") {
      editor.children = selectedContent;
      // notify placeholder/outer state that editor has content
      handleSlateValueChange(selectedContent);

      dispatch({ type: "CONTENT_LOADED" });
      lastSavedContent.current = selectedContent;
      lastRemoteContent.current = selectedContent;
    }

    setSlateStatus("idle");
  }, [
    thoughtId,
    selectedVersion?.content,
    editor,
    handleSlateValueChange,
    initialValue,
    setSlateStatus,
    state.isInitialised,
  ]);

  // ===== REMOTE UPDATES: apply conservatively to avoid stomping local edits =====
  useEffect(() => {
    if (!state.isInitialised || !selectedVersion) return;

    const remote = selectedVersion.content;
    // if remote equals lastSavedContent -> nothing new
    if (!hasContentChanged(lastSavedContent.current, remote)) {
      lastRemoteContent.current = remote;
      return;
    }

    // store remote; we will decide if/when to apply it
    lastRemoteContent.current = remote;

    // If the user currently has unsaved local changes, do not overwrite their optimistic state.
    // Instead wait until their changes are saved 
    // (the save ack logic above will attempt to apply remote).
    if (
      state.hasUnsavedContent || 
      slateStatus === "unsaved_change" || 
      slateStatus === "saving") {
      // Defer applying remote; we already saved lastRemoteContent for later reconciliation.
      return;
    }

    // Safe to apply remote directly (no unsaved local edits)
    isApplyingRemoteChange.current = true;
    editor.children = remote;
    editor.onChange();
    lastSavedContent.current = remote;
    setTimeout(() => {
      isApplyingRemoteChange.current = false;
    }, 100);
  }, [selectedVersion?._id, selectedVersion?.content, state.isInitialised, state.hasUnsavedContent, slateStatus]);

  // display content on editor after recording/transcription
  useEffect(() => {
    if (
      !currentContent ||
      currentContent.length === 0 ||
      !hasContentChanged(editor.children, currentContent) ||
      !allowContent
    )
      return;

    // insert transcribed content at the end (or at 0 if empty)
    const isEmpty = getContentLength(lastSavedContent.current) === 0;
    Transforms.insertNodes(editor, currentContent, {
      at: isEmpty ? [0] : [editor.children.length],
    });
    setAllowContent(false);
  }, [currentContent]);

  // ===== RENDER ELEMENTS & LEAVES (unchanged) =====
  const renderElement = useCallback((props: RenderElementProps) => {
    const { element } = props;

    switch (element.type) {
      case "code":
        return <CodeElement {...props} />;
      case "heading":
        return <HeadingElement {...props} />;
      case "bullet-list":
        return <BulletListElement {...props} />;
      case "numbered-list":
        return <NumberedListElement {...props} />;
      case "list-item":
        return <ListItemElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = (props: any) => {
    const leaf = props.leaf;
    return (
      <span
        {...props.attributes}
        style={{
          fontWeight: leaf.bold ? "800" : "normal",
          backgroundColor: leaf.highlight ? "#FE7A33" : "unset",
          fontStyle: leaf.italic ? "italic" : "normal",
          textDecoration: leaf.underline ? "underline" : leaf.linethrough ? "line-through" : "unset",
        }}
      >
        {props.children}
      </span>
    );
  };

  return (
    <Slate
      key={thoughtId}
      editor={editor}
      initialValue={editor.children}
      onChange={(v) => {
        // v is the current value - keep optimistic behaviour: call handleSlateValueChange with v
        handleSlateValueChange(v as any);
      }}
    >
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
  );
}