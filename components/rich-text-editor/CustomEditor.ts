import { Editor, Element, Text, Transforms } from "slate";

export const handleKeyDown = (e: React.KeyboardEvent, editor: Editor) => {
  const {key} = e;
  if (e.ctrlKey) {
    switch(key) {
      case "`":
        return CustomEditor.toggleCode(e, editor);
      case "b":
        return CustomEditor.toggleBold(e, editor);
      case 'h':
        return CustomEditor.toggleHightlight(e, editor);
    }
  }
}

const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    const isActive = marks && marks.bold === true;
    return isActive;
  },

  isCodeBlockActive(editor: Editor) {
    const [match] = Editor.nodes(editor, 
      {match: (n: any) => n.type === "code"}
    )
    return !!match;
  },

  isHighlightActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.highlight === true : false;
  },

  // toggle code block
  toggleCode(e: React.KeyboardEvent, editor: Editor) {
    e.preventDefault();
  
    const match = this.isCodeBlockActive(editor);
    
    Transforms.setNodes(
      editor,
      {type: match ? "paragraph" : "code"},
      {match: n => Element.isElement(n) && Editor.isBlock(editor, n)}
    )
  },


  // toggle bold leaf
  toggleBold(e: React.KeyboardEvent, editor: Editor){
    e.preventDefault();
    
    const match = this.isBoldMarkActive(editor);

    if (match) {
      return Editor.removeMark(editor, "bold");
    }
  
    Editor.addMark(editor, "bold", true);
  },

  // toggle highlight
  toggleHightlight (e: React.KeyboardEvent, editor: Editor) {
    e.preventDefault();
  
    const match = this.isHighlightActive(editor);
  
    if (match) {
      return Editor.removeMark(editor, "highlight");
    }
  
    Editor.addMark(editor, "highlight", true);
  }
}




