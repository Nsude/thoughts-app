import { RenderElementProps } from "slate-react";
import { type HeadingElement } from "./slate";

export function CodeElement(props: RenderElementProps) {
  return (
    <pre {...props.attributes} className="leading-[1.3] text-wrap bg-myGray border-1 border-border-gray border-b-0 border-t-0 px-[0.625rem]">
      <code>{props.children}</code>
    </pre>
  )
}

export function HeadingElement(props: RenderElementProps) {
  const {element, attributes, children} = props;

  const elem = element as HeadingElement;

  switch(elem.level) {
    case 1:
      return <h1 {...attributes} className="text-[2.5rem] mb-[0.5rem] font-hg-Bold" >{children}</h1>
    case 2:
      return <h2 {...attributes} className="text-[2rem] mb-[0.5rem] font-hg-Bold">{children}</h2>
    case 3:
      return <h3 {...attributes} className="text-[1.75rem] mb-[0.5rem] font-hg-Bold">{children}</h3>
  }
}

export function BulletListElement(props: RenderElementProps) {
  return <ul className="list-disc mx-[2.5rem] mt-2"  {...props.attributes}>{props.children}</ul>
}

export function NumberedListElement(props: RenderElementProps) {
  return <ol className="list-decimal mx-[2.5rem]" {...props.attributes} >{props.children}</ol>
}

export function ListItemElement(props: RenderElementProps) {
  return <li className="list-item tracking-[0.03ch] leading-[1.5] not-last:my-1.5" {...props.attributes} >{props.children}</li>
}

export function DefaultElement(props: RenderElementProps) {
  return (
    <p {...props.attributes} className="leading-[1.5] text-[1rem] tracking-[0.03ch]">{props.children}</p>
  )
}