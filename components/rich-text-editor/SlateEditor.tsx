import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

export default function SlateEditor({ handleClick, handleValueChange, thoughtId }: Props) {
  // editor instance 
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue: Descendant[] = useMemo(() => [
    {
      type: "paragraph",
      children: [{ text: "" }]
    }], []);

  const handleSlateValueChange = useCallback((content: any[]) => {
    handleValueChange(content); // call external value change
  }, [])

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