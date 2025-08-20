import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";



export type ParagraphElement = {type: "paragraph", children: CustomText[]};
export type HeadingElement = {type: "heading", level: 1 | 2 | 3, children: CustomText[]};
export type BulletLisElement = {type: "bullet-list", children: ListItemElement[]};
export type NumberedListElement = {type: "numbered-list", children: ListItemElement[]};
export type CodeElement = {type: "code", children: CustomText[]};

type ListItemElement = {type: "list-item", children: CustomText[]}

type CustomElement = 
ParagraphElement 
| HeadingElement 
| BulletLisElement 
| ListItemElement
| NumberedListElement
| CodeElement;

export type CustomText = {
  text: string;
  bold?: boolean;
  highlight?: boolean;
  italic?: boolean;
  underline?: boolean;
  linethrough?: boolean;
}


declare module 'slate' {
  interface CustomTypes {
    Editor: ReactEditor & BaseEditor;
    Element: CustomElement;
    text: CustomText;
  }
}