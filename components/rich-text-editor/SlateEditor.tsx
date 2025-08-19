import { useCallback, useMemo, useState } from "react"
import { createEditor, Descendant, Editor, Element, Transforms } from "slate"
import { withHistory } from "slate-history"
import {Editable, RenderElementProps, Slate, withReact} from "slate-react"
import { CodeElement, DefaultElement, HeadingElement } from "./CustomElements";
import { handleKeyDown } from "./CustomEditor";

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
    const {element, attributes, children} = props;

    switch (element.type) {
      case "code":
        return <CodeElement {...props} />
      case "heading":
        return <HeadingElement {...props} />
      default: 
        return <DefaultElement {...props} />
    }
  }, [])

  const renderLeaf = (props: any) => {
    return (
      <span {...props.attributes}
        style={{
          fontWeight: props.leaf.bold ? '800' : 'normal',
          backgroundColor: props.leaf.highlight ? "#FE7A33" : "unset"
        }}
      > 
        {props.children}
      </span>
    )
  }

  return (
    <Slate editor={editor} initialValue={initialValue} onValueChange={handleValueChange}>
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