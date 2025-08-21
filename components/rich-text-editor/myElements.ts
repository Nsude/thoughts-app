import DefaultIcon from "@/public/icons/DefaultIcon";
import { Editor } from "slate";
import { CustomEditor } from "./CustomEditor";

type ElementName = 
  "Text" 
  | "Heading 1" 
  | "Heading 2" 
  | "Heading 3"
  | "Bullet List"
  | "Numbered List"
  | "Code"
  | "Quote"

interface MyElement {
  name: ElementName;
  icon: any;
  handleClick: (editor: Editor) => void;
  shortCutLabel?: string;
}

export const myElements: MyElement[] = [
  {
    name: "Text",
    icon: DefaultIcon,
    handleClick: (editor) => CustomEditor.resetToParagraph(editor),
  },
  {
    name: "Heading 1",
    icon: DefaultIcon,
    handleClick: (editor) => CustomEditor.toggleHeadings(editor, 1),
    shortCutLabel: "#",
  },
  {
    name: "Heading 2",
    icon: DefaultIcon,
    handleClick: (editor) => CustomEditor.toggleHeadings(editor, 2),
    shortCutLabel: "##",
  },
  {
    name: "Heading 3",
    icon: DefaultIcon,
    handleClick: (editor) => CustomEditor.toggleHeadings(editor, 3),
    shortCutLabel: "###",
  },
  {
    name: "Bullet List",
    icon: DefaultIcon,
    handleClick: (editor) => CustomEditor.toggleBulletList(editor),
    shortCutLabel: "ctrl shift b"
  },
  {
    name: "Numbered List",
    icon: DefaultIcon,
    handleClick: (editor) => CustomEditor.toggleNumberedList(editor),
    shortCutLabel: "ctrl shift o"
  },
  {
    name: "Code",
    icon: DefaultIcon,
    handleClick: (editor) => CustomEditor.toggleCode(editor),
    shortCutLabel: "ctrl `"
  }
];
