import { useCallback, useMemo, useState } from "react"
import { createEditor, Descendant, Editor, Element, Transforms } from "slate"
import { withHistory } from "slate-history"
import {Editable, RenderElementProps, Slate, withReact} from "slate-react"
import { BulletListElement, CodeElement, DefaultElement, HeadingElement, ListItemElement, NumberedListElement } from "./CustomElements";
import { handleKeyDown } from "./CustomEditor";
import SlateNavbar from "./Navbar";
import InlineMenu from "./InlineMenu";

interface Props {
  handleClick?: () => void;
  handleValueChange?: (value: Descendant[]) => void
}

export default function SlateEditor({handleClick, handleValueChange}: Props) {
  // editor instance 
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue:Descendant[] = useMemo(() => [
    {
      type: "paragraph", 
      children: [{text: ""}]
    }
  ], []);

  const renderElement = useCallback((props: RenderElementProps) => {
    const {element} = props;

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
    <Slate editor={editor} initialValue={initialValue} onValueChange={handleValueChange}>
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