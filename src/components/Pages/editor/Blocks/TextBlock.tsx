import * as React from "react";

import { css, cx } from "@emotion/css";
import { Col, Container, Row } from "react-bootstrap";
import BlockPanel from "./BlockPanel";
import { TextData } from "./types";

import $ from "jquery";
import EditModal from "./EditModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import CodeMirror from '@uiw/react-codemirror';
import { darcula } from '@uiw/codemirror-theme-darcula';
import { markdown } from '@codemirror/lang-markdown';


type Props = {
    id: string,
    data: TextData,
    removeBlock: (x: string) => void,
    editBlock: (x: string) => void,
    updateBlock: (x: string, v: TextData) => void,
    moveBlockUp: (x: string) => void,
    moveBlockDown: (x: string) => void,
    setDidEdit: () => void,
    setNoEdit: () => void,
    dark?: boolean
};

type State = {
    showEditModal: boolean,
    wordCount: number,
    type: "markdown" | "plain" | null,
    editVal: string
};

export default class TextBlock extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            showEditModal: false,
            wordCount: this.count(this.props.data.text),
            type: this.props.data.type || "plain",
            editVal: this.props.data.text
        }

        this.showEditModal = this.showEditModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.discardEditModal = this.discardEditModal.bind(this);
    }

    count(s: string) {
        s = s.trim();
        return s === '' ? 0 : s.split(/\s+\b/).length;
    }

    async showEditModal() {
        this.setState({ showEditModal: true }, () => {
            $(`#txt-${this.props.id}`).trigger('focus');
            const val = $(`#txt-${this.props.id}`).val();
            $(`#txt-${this.props.id}`).val('');
            $(`#txt-${this.props.id}`).val(val as string);
        });
    }

    async closeEditModal() {
        this.props.updateBlock(this.props.id, {
            text: this.state.editVal, // $(`#txt-${this.props.id}`).val() as string,
            type: this.state.type
        });
        this.props.setDidEdit();
        this.setState({ showEditModal: false });
    }

    async discardEditModal() {
        this.setState({ showEditModal: false });
    }

    render() {
        return (
            <div
                style={{ minHeight: 97 }}
                className={cx(css`
                    @media(max-width: 992px) {
                        /*&:hover {
                            margin-top: -42px;
                        }
                        &:hover > .show-on-hover {
                            display: inline-block !important;
                            transition-delay: 2s;
                        }*/
                    }
                `
                )}
            >
                <div
                    style={{
                        width: "100%", background: this.props.dark ? "#161616" : "white",
                        border: "1px solid", borderColor: this.props.dark ? "#343434" : "#dcdcdc",
                        borderRadius: ".35rem", fontFamily: "Jost", fontSize: 17, // padding: 40,
                        whiteSpace: "pre-wrap", overflowWrap: "anywhere",
                        color: this.props.dark ? "whitesmoke" : "black", lineHeight: 1.4
                    }}
                    className={cx(css`
                        & > p {
                            margin-bottom: 0px !important;
                        }
                    `)}
                >
                    <div style={{ padding: 40 }}>
                        {
                            (this.props.data.type === "markdown") ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    className={cx(css`
                                    .contains-task-list {
                                        list-style-type: none !important;
                                        padding: 0px !important;
                                    }
                                    & > pre {
                                        border: 1px solid ${this.props.dark ? "#343434" : "#dcdcdc"};
                                        background: ${this.props.dark ? "black" : "whitesmoke"};
                                        ${this.props.dark && "color: whitesmoke;"}
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
                                >
                                    {this.props.data.text}
                                </ReactMarkdown>
                            ) : (this.props.data.text)
                        }
                    </div>
                    <BlockPanel
                        id={this.props.id}
                        showEditModal={this.showEditModal}
                        removeBlock={this.props.removeBlock}
                        editBlock={this.props.editBlock}
                        moveBlockUp={this.props.moveBlockUp}
                        moveBlockDown={this.props.moveBlockDown}
                        setDidEdit={this.props.setDidEdit}
                        dark={this.props.dark}
                        blockName="Text"
                    />
                </div>
                <button hidden id={`open-edit-modal-${this.props.id}`} onClick={() => { this.setState({ showEditModal: true }); }} />
                <EditModal
                    header={"Paragraph"}
                    showEditModal={this.state.showEditModal}
                    discardEditModal={this.discardEditModal}
                    closeEditModal={this.closeEditModal}
                    dark={this.props.dark}
                >
                    <Container fluid>
                        <Row>
                            <Col>
                                {
                                    this.state.type === "plain" ? (
                                        <textarea
                                            id={`txt-${this.props.id}`}
                                            style={{
                                                width: "100%", padding: 20, fontFamily: "Jost", height: "50vh",
                                                resize: "none", borderRadius: ".35rem", margin: 0,
                                                border: "1px solid", fontSize: "13pt", marginBottom: 2,
                                                borderColor: this.props.dark ? "#343434" : "#dcdcdc",
                                                background: this.props.dark ? "#161616" : "white",
                                                color: this.props.dark ? "whitesmoke" : "#333"
                                            }}

                                            className={cx(css`
                                                &:focus {
                                                    outline: none;
                                                }
                                            `)}
                                            onChange={() => {
                                                const val = $(`#txt-${this.props.id}`).val() as string;
                                                this.setState({
                                                    wordCount: this.count(val),
                                                    editVal: val
                                                });
                                            }}
                                            value={this.state.editVal}
                                        />
                                    ) : (
                                        <CodeMirror
                                            value={this.state.editVal}
                                            id={`code-${this.props.id}`}
                                            theme={this.props.dark ? darcula : undefined}
                                            style={{
                                                borderRadius: ".35rem",
                                                border: "1px solid",
                                                borderColor: this.props.dark ? "#343434" : "#dcdcdc",
                                                outline: "none",
                                                marginBottom: 8
                                            }}
                                            className={cx(css`
                                                & > div, & > div > div {
                                                    border-radius: .35rem;
                                                }
                                                & > div {
                                                    &, &:focus{
                                                        outline: none !important;
                                                    }
                                                }
                                                .cm-content {
                                                    white-space: normal !important;
                                                }
                                            `)}
                                            onChange={(value, y) => {
                                                this.setState({
                                                    editVal: value
                                                });
                                            }}
                                            extensions={[markdown()]}
                                            height="50vh"
                                        />
                                    )

                                }
                                <small className="text-muted" hidden={this.state.type !== "plain"}>
                                    &nbsp;
                                    {
                                        (() => {
                                            const length = this.count(this.state.editVal);
                                            return (length + ' ' + (length === 1 ? "word" : "words"));
                                        })()
                                    }
                                </small>
                                <small style={{ float: "right", marginTop: 5 }}>
                                    <span
                                        className={cx(css`
                                            font-size: 10pt;
                                            padding: 5px 10px;
                                            border-radius: .35rem;
                                            position: relative;
                                            bottom: 2px;
                                            ${this.props.dark && "color: whitesmoke;"}
                                        `, this.state.type !== "plain" ? css`
                                            &:hover { 
                                                background: ${this.props.dark ? "#343434" : "rgba(0, 0, 0, 0.08)"};
                                                cursor: pointer;
                                            }
                                        ` : css`
                                            background: ${this.props.dark ? "#343434" : "rgba(0, 0, 0, 0.08)"};
                                        `)}
                                        onClick={() => { this.setState({ type: "plain" }); }}
                                    >
                                        Plain
                                    </span>
                                    &nbsp;
                                    <span
                                        className={cx(css`
                                            font-size: 10pt;
                                            padding: 5px 10px;
                                            border-radius: .35rem;
                                            position: relative;
                                            bottom: 2px;
                                            ${this.props.dark && "color: whitesmoke;"}
                                        `, this.state.type !== "markdown" ? css`
                                            &:hover { 
                                                background: ${this.props.dark ? "#343434" : "rgba(0, 0, 0, 0.08)"};
                                                cursor: pointer;
                                            }
                                        ` : css`
                                            background: ${this.props.dark ? "#343434" : "rgba(0, 0, 0, 0.08)"};
                                        `)}
                                        onClick={() => { this.setState({ type: "markdown" }); }}
                                    >
                                        Markdown
                                    </span>
                                </small>
                            </Col>
                        </Row>
                    </Container>
                </EditModal>
            </div>
        )
    }

}