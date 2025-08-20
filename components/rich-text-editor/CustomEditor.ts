import { Editor, Element, Path, Text, Transforms } from "slate";
import { CustomText } from "./slate";

export const handleKeyDown = (e: React.KeyboardEvent, editor: Editor) => {
  const { key } = e;

  if (key.toLowerCase() === "enter") {
    CustomEditor.breaklist(editor);
  }

  if (e.ctrlKey) {
    switch (key) {
      case "`":
        // turn to code block
        return CustomEditor.toggleCode(e, editor);
      case "b":
        // make bold
        return CustomEditor.toggleBold(e, editor);
      case "h":
        // highlight mark
        return CustomEditor.toggleHightlight(e, editor);
      case "i":
        // italic mark
        return CustomEditor.toggleItalic(e, editor);
      case "u":
        // underline mark
        return CustomEditor.toggleUnderline(e, editor);
      case "l":
        // line-through mark
        return CustomEditor.toggleLineThroug(e, editor);
    }
  }

  // CTRL + SHIFT
  if (e.ctrlKey && e.shiftKey && key) {
    switch (key.toLowerCase()) {
      case "o":
        // ordered list
        return CustomEditor.toggleNumberedList(editor, e);
      case "b":
        // bullet list
        return CustomEditor.toggleBulletList(editor, e);
    }
  }
};

export const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const marks = Editor.marks(editor) as { bold?: boolean } | null;
    return marks?.bold === true;
  },

  isCodeBlockActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n: any) => n.type === "code",
    });
    return !!match;
  },

  isHighlightActive(editor: Editor) {
    const marks = Editor.marks(editor) as CustomText;
    return marks.highlight === true;
  },

  isItalicActive(editor: Editor) {
    const marks = Editor.marks(editor) as CustomText;
    return marks.italic === true;
  },

  isUnderlineActive(editor: Editor) {
    const marks = Editor.marks(editor) as CustomText;
    return marks.underline === true;
  },

  isLinethroughActive(editor: Editor) {
    const marks = Editor.marks(editor) as CustomText;
    return marks.linethrough === true;
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

    const type = match ? { type: "paragraph" } : { type: "heading", level };

    Transforms.setNodes(editor, type as Partial<Element>, {
      match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
    });
  },

  // bullet list
  isBulletlistActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n: any) => n.type === "bullet-list",
    });

    return !!match;
  },

  toggleBulletList(editor: Editor, e?: React.KeyboardEvent) {
    if (e) e.preventDefault();

    const match = this.isBulletlistActive(editor);

    if (match) {
      this.breaklist(editor);
    } else {
      Transforms.setNodes(editor, { type: "list-item" });

      Transforms.wrapNodes(editor, { type: "bullet-list", children: [] });
    }
  },

  // numbered list
  isNumberedlistActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: (n: any) => n.type === "numbered-list",
    });

    return !!match;
  },

  toggleNumberedList(editor: Editor, e?: React.KeyboardEvent) {
    if (e) e.preventDefault();
    const match = this.isNumberedlistActive(editor);

    if (match) {
      this.breaklist(editor);
    } else {
      // Creating list logic stays the same
      Transforms.setNodes(editor, { type: "list-item" });
      Transforms.wrapNodes(editor, {
        type: "numbered-list",
        children: [],
      });
    }
  },

  breaklist(editor: Editor) {
    const match =
      this.isBulletlistActive(editor) || this.isNumberedlistActive(editor);

    if (!match) return;

    Transforms.setNodes(
      editor,
      { type: "paragraph" },
      {
        match: (n) =>
          Element.isElement(n) &&
          n.type === "list-item" &&
          Editor.isEmpty(editor, n),
        mode: "lowest",
      }
    );

    Transforms.liftNodes(editor, {
      match: (n) => Element.isElement(n) && n.type === "paragraph",
    });
  },
};
