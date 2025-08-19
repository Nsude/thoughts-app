import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";



type ParagraphElement = {type: "paragraph", children: CustomText[]};
export type HeadingElement = {type: "heading", level: 1 | 2 | 3, children: CustomText[]};
type ListElement = {type: "bullet-list", children: CustomText[]};
type ListItemElement = {type: "numbered-list", children: CustomText[]};
type CodeElement = {type: "code", children: CustomText[]};

type CustomElement = 
ParagraphElement 
| HeadingElement 
| ListElement 
| ListItemElement 
| CodeElement;

type CustomText = {
  text: string;
  bold?: boolean;
  highlight?: boolean;
  italic?: boolean;
}


declare module 'slate' {
  interface CustomTypes {
    Editor: ReactEditor & BaseEditor;
    Element: CustomElement;
    text: CustomText;
  }
}