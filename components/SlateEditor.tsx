import { useMemo, useState } from "react"
import { createEditor, Descendant } from "slate"
import { withHistory } from "slate-history"
import {Editable, Slate, withReact} from "slate-react"

interface Props {
  handleClick?: () => void;
  handleValueChange?: (value: Descendant[]) => void
}

export default function SlateEditor({handleClick, handleValueChange}: Props) {
  // editor instance 
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue = useMemo(() => [
    {
      type: "paragraph", 
      children: [{text: ""}]
    }
  ], []);

  return (
    <Slate editor={editor} initialValue={initialValue} onValueChange={handleValueChange}>
      <Editable 
        className="focus:outline-none"
        onClick={handleClick}
       />
    </Slate>
  )
}