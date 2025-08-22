import DefaultIcon from "@/public/icons/DefaultIcon";
import { Editor } from "slate";
import { CustomEditor } from "./CustomEditor";
import TextIcon from "@/public/icons/TextIcon";
import HeadingOneIcon from "@/public/icons/HeadingOneIcon";
import HeadingTwoIcon from "@/public/icons/HeadingTwoIcon";
import HeadingThreeIcon from "@/public/icons/HeadingThreeIcon";
import BulletListIcon from "@/public/icons/BulletListIcon";
import NumberedListIcon from "@/public/icons/NumberedListIcon";
import CodeIcon from "@/public/icons/CodeIcon";

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
    icon: TextIcon,
    handleClick: (editor) => CustomEditor.resetToParagraph(editor),
  },
  {
    name: "Heading 1",
    icon: HeadingOneIcon,
    handleClick: (editor) => CustomEditor.toggleHeadings(editor, 1),
    shortCutLabel: "#",
  },
  {
    name: "Heading 2",
    icon: HeadingTwoIcon,
    handleClick: (editor) => CustomEditor.toggleHeadings(editor, 2),
    shortCutLabel: "##",
  },
  {
    name: "Heading 3",
    icon: HeadingThreeIcon,
    handleClick: (editor) => CustomEditor.toggleHeadings(editor, 3),
    shortCutLabel: "###",
  },
  {
    name: "Bullet List",
    icon: BulletListIcon,
    handleClick: (editor) => CustomEditor.toggleBulletList(editor),
    shortCutLabel: "ctrl shift b"
  },
  {
    name: "Numbered List",
    icon: NumberedListIcon,
    handleClick: (editor) => CustomEditor.toggleNumberedList(editor),
    shortCutLabel: "ctrl shift o"
  },
  {
    name: "Code",
    icon: CodeIcon,
    handleClick: (editor) => CustomEditor.toggleCode(editor),
    shortCutLabel: "ctrl `"
  }
];
