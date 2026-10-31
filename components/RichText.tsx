import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";
import Carousel from "./Carousel";
import { AudioPlayer, VideoPlayer } from "./MediaPlayer";

const options: HTMLReactParserOptions = {
  replace(node) {
    if (!(node instanceof Element)) return;
    const { src = "", title = "", style = "" } = node.attribs;
    if (node.name === "audio") return <AudioPlayer src={src} title={title} />;
    if (node.name === "video") return <VideoPlayer src={src} title={title} size={/width:\s*(\d+%)/.exec(style)?.[1]} align={node.attribs["data-align"]} ratio={node.attribs["data-ratio"]} />;
    if (node.attribs["data-layout"] === "carousel") {
      const slides = node.children.filter((c) => c instanceof Element);
      return <Carousel ratio={node.attribs["data-ratio"]} slides={slides.map((s) => domToReact(s.children as DOMNode[], options))} />;
    }
  },
};

/** Renders admin-authored HTML. It is sanitised when saved (lib/content/sanitize.ts). */
export default function RichText({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;
  return <div className={`rich ${className}`.trim()}>{parse(html, options)}</div>;
}
