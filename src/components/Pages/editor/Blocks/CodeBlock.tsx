import * as React from "react";

import { css, cx } from "@emotion/css";
import { Col, Container, Form, Row } from "react-bootstrap";
import { Copy } from "react-feather";
import BlockPanel from "./BlockPanel";
import { CodeBlockData } from "./types";

import CodeMirror from '@uiw/react-codemirror';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import $ from "jquery";
import EditModal from "./EditModal";
import { darcula } from "@uiw/codemirror-theme-darcula";

type Props = {
    id: string,
    data: CodeBlockData,
    removeBlock: (x: string) => void,
    editBlock: (x: string) => void,
    updateBlock: (x: string, y: CodeBlockData) => void,
    moveBlockUp: (x: string) => void,
    moveBlockDown: (x: string) => void,
    setDidEdit: () => void,
    setNoEdit: () => void,
    dark?: boolean
};

type State = {
    showEditModal: boolean,
    editVal: string
};

export default class CodeBlock extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            showEditModal: false,
            editVal: this.props.data.code
        }

        this.showEditModal = this.showEditModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.discardEditModal = this.discardEditModal.bind(this);
    }

    async showEditModal() {
        this.setState({ showEditModal: true }, () => {
            $(`#code-${this.props.id}`).trigger('focus');
            const val = $(`#code-${this.props.id}`).val();
            $(`#code-${this.props.id}`).val('');
            $(`#code-${this.props.id}`).val(val as string);
        });
    }

    async closeEditModal() {
        this.props.updateBlock(this.props.id, {
            code: this.state.editVal,
            lang: $(`#lang-select-${this.props.id}`).val() as string
        });
        this.props.setDidEdit();
        this.setState({ showEditModal: false });
    }

    async discardEditModal() {
        this.setState({ showEditModal: false });
    }

    render() {
        return (
            <div style={{ minHeight: 97 }}>
                <BlockPanel
                    id={this.props.id}
                    showEditModal={this.showEditModal}
                    removeBlock={this.props.removeBlock}
                    editBlock={this.props.editBlock}
                    moveBlockUp={this.props.moveBlockUp}
                    moveBlockDown={this.props.moveBlockDown}
                    setDidEdit={this.props.setDidEdit}
                    dark={this.props.dark}
                />
                <>
                    <div
                        style={{
                            width: "100%",
                            border: "1px solid",
                            borderBottom: 0,
                            borderTopRightRadius: ".35rem",
                            borderTopLeftRadius: ".35rem",
                            background: this.props.dark ? "#1A1A1B" : "white",
                            borderColor: this.props.dark ? "#444" : "#dcdcdc",
                            padding: "5px 6px"
                        }}
                    >
                        &nbsp;&nbsp;
                        <Copy
                            style={{ padding: 5, borderRadius: ".35rem" }}
                            className={cx(css`
                                    ${this.props.dark && "color: whitesmoke;"}
                                    &:hover { 
                                        background: ${this.props.dark ? "#444" : "whitesmoke"};
                                        cursor: pointer;
                                    }
                                `)}
                            size={25}
                        />
                        <span style={{ float: "right", color: "grey", fontFamily: "Jost" }}>
                            {this.props.data.lang}
                            &nbsp;&nbsp;
                        </span>
                    </div>
                    <pre style={{
                        padding: 25, border: "1px solid",
                        borderBottomRightRadius: ".35rem",
                        borderBottomLeftRadius: ".35rem",
                        fontSize: "87.5%", lineHeight: 1.6,
                        marginBottom: 0, maxWidth: "calc(100vw - 30px)",
                        background: this.props.dark ? "#1A1A1B" : "white",
                        borderColor: this.props.dark ? "#444" : "#dcdcdc",
                        color: this.props.dark ? "whitesmoke" : "black"
                    }}>
                        <code
                            className={cx(css`
                                    pre {
                                        background: inherit !important;
                                        padding: 0px !important;
                                        border: none !important;
                                        box-shadow: none !important;
                                        margin: 0px !important;
                                        font-size: 100% !important;
                                        padding-bottom: 10px !important;
                                    }
                                `)}
                        >
                            {
                                this.props.data.lang === "plain" ? this.props.data.code : (
                                    <SyntaxHighlighter language={this.props.data.lang} style={this.props.dark ? dark : undefined}>
                                        {this.props.data.code}
                                    </SyntaxHighlighter>
                                )
                            }
                        </code>
                    </pre>
                </>
                <EditModal
                    header="Code Block"
                    showEditModal={this.state.showEditModal}
                    discardEditModal={this.discardEditModal}
                    closeEditModal={this.closeEditModal}
                    dark={this.props.dark}
                >
                    <Container fluid>
                        <Row>
                            <Col>
                                <CodeMirror
                                    value={this.props.data.code}
                                    id={`code-${this.props.id}`}
                                    theme={this.props.dark ? darcula : undefined}
                                    style={{
                                        borderRadius: ".45rem",
                                        border: "2px solid",
                                        borderColor: this.props.dark ? "#444" : " #dcdcdc",
                                        outline: "none"
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
                                        .cm-gutters {
                                            ${this.props.dark && "background: #444;"}
                                        }
                                    `)}
                                    onChange={(value, y) => {
                                        this.setState({
                                            editVal: value
                                        });
                                    }}
                                    height="300px"
                                />
                                <br />
                                <fieldset style={{
                                    border: this.props.dark ? "3px solid #444" : "3px solid #dcdcdc",
                                    borderRadius: ".35rem",
                                    padding: "10px 20px 15px 20px",
                                    fontFamily: "Jost",
                                    color: this.props.dark ? "whitesmoke" : "black"
                                }}>
                                    <legend style={{ width: "auto", fontSize: "14pt", marginBottom: 0, color: this.props.dark ? "whitesmoke" : "black" }}>
                                        &nbsp;Settings&nbsp;
                                    </legend>
                                    <Container fluid>
                                        <Row>
                                            <Col>
                                                <Form>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                        <Form.Label>Syntax Highlighting</Form.Label>
                                                        <Form.Control
                                                            as="select"
                                                            id={`lang-select-${this.props.id}`}
                                                            defaultValue={this.props.data.lang}
                                                            style={{
                                                                borderColor: this.props.dark ? "#444" : "#dcdcdc",
                                                                background: this.props.dark ? "#1A1A1B" : "white",
                                                                color: this.props.dark ? "whitesmoke" : "#333"
                                                            }}
                                                        >
                                                            <option value="plain">None</option>
                                                            <hr />
                                                            {
                                                                [
                                                                    { value: "javascript", text: "Javascript" },
                                                                    // { value: "jsx", text: "jsx" },
                                                                    { value: "typescript", text: "Typescript" },
                                                                    // { value: "tsx", text: "tsx" },
                                                                    { value: "c", text: "C" },
                                                                    { value: "cpp", text: "C++" },
                                                                    { value: "coljure", text: "Clojure" },
                                                                    { value: "elixir", text: "Elixir" },
                                                                    { value: "fortran", text: "FORTRAN" },
                                                                    { value: "fsharp", text: "F#" },
                                                                    { value: "lisp", text: "LISP" },
                                                                    { value: "go", text: "GO" },
                                                                    { value: "java", text: "Java" },
                                                                    { value: "latex", text: "LaTeX" },
                                                                    { value: "makefile", text: "Makefile" },
                                                                    { value: "sql", text: "SQL" },
                                                                    { value: "scala", text: "Scala" },
                                                                    { value: "python", text: "Python" },
                                                                    { value: "haskell", text: "Haskell" },
                                                                    { value: "markdown", text: "Markdown" },
                                                                    { value: "rust", text: "Rust" },
                                                                    { value: "json", text: "JSON" },
                                                                    { value: "html", text: "HTML" },
                                                                    { value: "css", text: "CSS" },
                                                                    { value: "swift", text: "Swift" },
                                                                    { value: "brainfuck", text: "Brainf**k" },
                                                                    { value: "perl", text: "Perl" },
                                                                    { value: "lua", text: "Lua" },
                                                                    { value: "julia", text: "Julia" }
                                                                ].sort((x, y) => {
                                                                    const a = x.text.toLowerCase();
                                                                    const b = y.text.toLowerCase();
                                                                    return a < b ? -1 : a > b ? 1 : 0;
                                                                }).map(x => <option value={x.value}>{x.text}</option>)
                                                            }
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Form>
                                            </Col>
                                            <Col>
                                            </Col>
                                        </Row>
                                    </Container>
                                </fieldset>
                            </Col>
                        </Row>
                    </Container>
                </EditModal>
            </div>
        )
    }

}