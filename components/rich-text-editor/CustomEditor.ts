import { Editor, Element, Text, Transforms } from "slate";

export const handleKeyDown = (e: React.KeyboardEvent, editor: Editor) => {
  const { key } = e;
  if (e.ctrlKey) {
    switch (key) {
      case "`":
        return CustomEditor.toggleCode(e, editor);
      case "b":
        return CustomEditor.toggleNumberedList(e, editor);
      case "h":
        return CustomEditor.toggleHightlight(e, editor);
      case "i":
        return CustomEditor.toggleItalic(e, editor);
      case "u":
        return CustomEditor.toggleUnderline(e, editor);
      case "l":
        return CustomEditor.toggleLineThroug(e, editor);
    }
  }

  // CTRL + SHIFT
  if (e.ctrlKey && e.shiftKey) {
    switch (key) {
      case "o":
        return CustomEditor.toggleNumberedList(e, editor);
    }
  }
};

export const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    const isActive = marks && marks.bold === true;
    return isActive;
  },

  isCodeBlockActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n: any) => n.type === "code",
    });
    return !!match;
  },

  isHighlightActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.highlight === true : false;
  },

  isItalicActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.italic === true : false;
  },

  isUnderlineActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.underline === true : false;
  },

  isLinethroughActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.linethrough === true : false;
  },

  // toggle line through
  toggleLineThroug(e: React.KeyboardEvent, editor: Editor) {
    e.preventDefault();

    const match = this.isLinethroughActive(editor);

    if (match) {
      return Editor.removeMark(editor, "linethrough");
    }

    Editor.addMark(editor, "linethrough", true);
  },

  // toggle underline
  toggleUnderline(e: React.KeyboardEvent, editor: Editor) {
    e.preventDefault();

    const match = this.isUnderlineActive(editor);

    if (match) {
      return Editor.removeMark(editor, "underline");
    }

    Editor.addMark(editor, "underline", true);
  },

  // toggle italic
  toggleItalic(e: React.KeyboardEvent, editor: Editor) {
    e.preventDefault();

    const match = this.isItalicActive(editor);

    if (match) {
      return Editor.removeMark(editor, "italic");
    }

    Editor.addMark(editor, "italic", true);
  },

  // toggle code block
  toggleCode(e: React.KeyboardEvent, editor: Editor) {
    e.preventDefault();

    const match = this.isCodeBlockActive(editor);

    Transforms.setNodes(
      editor,
      { type: match ? "paragraph" : "code" },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },

  // toggle bold leaf
  toggleBold(e: React.KeyboardEvent, editor: Editor) {
    e.preventDefault();

    const match = this.isBoldMarkActive(editor);

    if (match) {
      return Editor.removeMark(editor, "bold");
    }

    Editor.addMark(editor, "bold", true);
  },

  // toggle highlight
  toggleHightlight(e: React.KeyboardEvent, editor: Editor) {
    e.preventDefault();

    const match = this.isHighlightActive(editor);

    if (match) {
      return Editor.removeMark(editor, "highlight");
    }

    Editor.addMark(editor, "highlight", true);
  },

  // ===== BLOCK LEVEL ELEMENTS =====
  isHeadingElement(editor: Editor, level: number) {
    const [match] = Editor.nodes(editor, {
      match: (n: any) => n.type === "heading" && n.level === level,
    });
    return !!match;
  },

  toggleHeadings(editor: Editor, level: number) {
    let match = this.isHeadingElement(editor, level);

    const type = match ? 
    {type: "paragraph"} : {type: "heading", level};

    Transforms.setNodes(
      editor,
      type as Partial<Element>,
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },


  // bullet list
  isBulletlistActive(editor: Editor) {
    const [match] = Editor.nodes(
      editor,
      {match: (n: any) => n.type === "bullet-list"}
    )
    
    return !!match;
  },
  
  toggleBulletList(editor: Editor) {
    const match = this.isBulletlistActive(editor);
    Transforms.setNodes(
      editor,
      {type: match ? "paragraph" : "bullet-list"},
      {match: n => Element.isElement(n) && Editor.isBlock(editor, n)}
    )
  },

  // numbered list 
  isNumberedlistActive(editor: Editor) {
    const [match] = Editor.nodes(
      editor,
      {match: (n: any) => n.type === "numbered-list"}
    )

    return !!match;
  },

  toggleNumberedList(e: React.KeyboardEvent, editor: Editor) {
    e.preventDefault();
    
    const match = this.isNumberedlistActive(editor);

    console.log(match)

    Transforms.setNodes(
      editor,
      {type: match ? "paragraph" : "numbered-list"},
      {match: n => Element.isElement(n) && Editor.isBlock(editor, n)}
    )
  }
};
