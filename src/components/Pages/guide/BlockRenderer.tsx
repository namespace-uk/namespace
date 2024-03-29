import { css, cx } from "@emotion/css";
import TeX from '@matejmazur/react-katex';
import { Hash } from "react-feather";
import ReactMarkdown from "react-markdown";
import { CodeBlockData, EmbedData } from "../editor/Blocks/types";
import CodeBlock from "./Blocks/Code";
import Embed from "./Blocks/Embed";
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import Img from "./Blocks/Img";
import { ImageData } from "../editor/Blocks/types";

export default class BlockRenderer {

    static render(blocks: ({ type: string, data: any, id: string })[], dark?: boolean, wideImg?: boolean) {
        return blocks.map(x => {
            switch (x.type) {
                case "textseq": {
                    return (
                        <>
                            <div 
                                style={{ 
                                    width: "100%", background: dark ? "#1A1A1B" : "white", 
                                    border: "1px solid", borderColor: dark ? "#444" : "#dcdcdc",
                                    borderRadius: ".35rem", fontFamily: "Jost", fontSize: 17, padding: 40,
                                    whiteSpace: "pre-wrap", overflowWrap: "anywhere",
                                    color: dark ? "whitesmoke" : "black", lineHeight: 1.4
                                }}
                                className={cx(css`
                                    & > p {
                                        margin-bottom: 0px !important;
                                    }
                                    ${dark && "hr { border-color: #444; }"}
                                `)}
                            >
                                {
                                    (x.data.text as string[])
                                    .map(y => (x.data.type === "markdown") ? (
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm, remarkMath]} 
                                                rehypePlugins={[rehypeKatex]}
                                                className={cx(css`
                                                    .contains-task-list {
                                                        list-style-type: none !important;
                                                        padding: 0px !important;
                                                    }
                                                    & > pre {
                                                        border: 1px solid ${dark ? "#444" : "#dcdcdc"};
                                                        background: ${dark ? "black" : "whitesmoke"};
                                                        ${dark && "color: whitesmoke;"}
                                                        padding: 20px;
                                                        border-radius: .35rem;
                                                    }
                                                    & > p {
                                                        margin-bottom: 0px !important;
                                                        code {
                                                            border: 1px solid #dcdcdc;
                                                            background: whitesmoke;
                                                            padding: 2px 6px;
                                                            border-radius: .35rem;
                                                        }
                                                    }
                                                    .math-inline {
                                                        font-size: 12pt !important;
                                                    }
                                                    ul, ol {
                                                        margin-top: -10px;
                                                        margin-bottom: 0;
                                                        white-space: normal;
                                                        li {
                                                            padding: 5px;
                                                        }
                                                    }
                                                `)}
                                            >{y}</ReactMarkdown>
                                        ) : (<>{y}</>)
                                    )
                                    .reduce((prev: JSX.Element[],curr) => { prev.push(curr, (<hr style={{ marginTop: "1.4rem", marginBottom: "1.4rem" }}/>)); return prev; }, [])
                                    .slice(0,-1)
                                }
                            </div>
                        </>
                    );
                }
                case "katexseq" : return (
                    <>
                        <div 
                            style={{
                                width: "100%",
                                borderRadius: ".35rem",
                                border: "1px solid",
                                padding: 25,
                                overflow: "auto"
                            }}
                            className={cx(dark ? css`
                                background: #1A1A1B;
                                border-color: #444 !important;
                                color: whitesmoke;
                                hr { border-color: #444; }
                            ` : css`
                                background: white;
                                border-color: #dcdcdc !important;
                            `)}
                        >
                            {
                                (x.data as string[])
                                .map(x => 
                                    (
                                        <TeX 
                                            settings={{ displayMode: true }} 
                                            className={cx(css`
                                                .katex {
                                                    white-space: unset !important;
                                                }
                                                .base {
                                                    max-width: 100%;
                                                    word-break: break-all;
                                                    white-space: unset;
                                                    width: auto !important;
                                                }
                                                .mord {
                                                    max-width: 100%;
                                                }
                                                .katex-html {
                                                    white-space: normal !important;
                                                }
                                            `)}
                                            style={{ margin: "40px 0px" }} 
                                            block
                                        >
                                            {x}
                                        </TeX>
                                    )
                                )
                                .reduce((prev: JSX.Element[],curr) => { prev.push(curr, (<hr/>)); return prev; }, [])
                                .slice(0,-1)
                            }
                        </div>
                    </>
                );
                case "section" : return (
                    <>
                        <div
                            id={`sec-${(x as unknown as {id: string}).id}`}
                            style={{ 
                                width: "100%", 
                                fontFamily: "Jost",
                                fontWeight: "bold",
                                fontSize: 35,
                                textAlign: "center",
                                border: dark ? "3px solid #444" : "3px solid #c4c4c4",
                                background: dark ? "#1A1A1B" : "rgba(220, 220, 220, 0.6)",
                                color: dark ? "whitesmoke" : "#333",
                                borderRadius: ".35rem",
                                padding: 20
                            }}
                        >
                            <Hash size={25} color="grey"/>
                            {(x.data as { header: string }).header}
                        </div>
                    </>
                );
                case "code": return (
                    <CodeBlock data={x.data as CodeBlockData} id={x.id} dark={dark}/>
                )
                case "embed": return (
                    <Embed data={x.data as EmbedData} id={x.id}/>
                );
                case "img": return (
                    <Img
                        id={x.id}
                        data={x.data as ImageData}
                        dark={dark}
                        wide={wideImg}
                    />
                );
                default : return (<></>)
            }
        }).map(x => [x, <div style={{ height: 25 }}/>])
    }

}