import * as React from "react";

import TeX from '@matejmazur/react-katex';
import { KaTeXData } from "./types";
import { Container, Row, Col } from "react-bootstrap";
import { css, cx } from "@emotion/css";
import BlockPanel from "./BlockPanel";

import CodeMirror from '@uiw/react-codemirror';
import EditModal from "./EditModal";

import $ from "jquery";
import { darcula } from "@uiw/codemirror-theme-darcula";

type Props = {
    id: string,
    data: KaTeXData,
    removeBlock: (x: string) => void,
    editBlock: (x: string) => void,
    updateBlock: (x: string, y: KaTeXData) => void,
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

export default class KaTeX extends React.Component<Props, State> {

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
        this.setState({ 
            showEditModal: true,
            editVal: this.props.data.code
        }, () => {
            $(`#ktx-${this.props.id}`).trigger('focus');
        });
    }

    async closeEditModal() {
        this.props.updateBlock(this.props.id, {
            code: this.state.editVal
        });
        this.props.setDidEdit();
        this.setState({ showEditModal: false });
    }

    async discardEditModal() {
        this.setState({ showEditModal: false });
    }

    render() {
        const textBtnStyle = { 
            marginBottom: 10, 
            width: 90, 
            fontVariant: "small-caps", 
            fontSize: "1.1rem", 
            borderRadius: ".35rem", 
            borderWidth: "2px",
            transitionDuration: "0s"
        };
        const whiteBg = css`
            &:not(:hover) {
                background: white;
            }
        `;

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
                <div 
                    style={{
                        width: "100%",
                        borderRadius: ".35rem",
                        border: "1px solid",
                        padding: 25,
                        overflow: "auto"
                    }}
                    className={cx(this.props.dark ? css`
                        background: #1A1A1B;
                        border-color: #444 !important;
                        color: whitesmoke;
                    ` : css`
                        background: white;
                        border-color: #dcdcdc !important;
                    `)}
                >
                    <TeX 
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
                    block>{this.props.data.code}</TeX>
                </div>
                <EditModal 
                    header={"KaTeX"} 
                    showEditModal={this.state.showEditModal} 
                    discardEditModal={this.discardEditModal} 
                    closeEditModal={this.closeEditModal}
                    dark={this.props.dark}
                >
                    <Container>
                        <Row>
                            <Col>
                                <div style={{
                                    width: "100%",
                                    borderRadius: ".35rem",
                                    border: "1px solid",
                                    background: this.props.dark ? "#1A1A1B" : "white",
                                    borderColor: this.props.dark ? "#444" : "#dcdcdc",
                                    color: this.props.dark ? "white" : "black",
                                    padding: 25,
                                    overflow: "auto",
                                    minHeight: 129.03
                                }}>
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
                                        block
                                    >
                                        {String.raw`${this.state.editVal}`}
                                    </TeX>
                                </div>
                                <br/>
                                <CodeMirror
                                    value={this.props.data.code}
                                    id={`code-${this.props.id}`}
                                    theme={this.props.dark ? darcula : undefined}
                                    style={{ 
                                        borderRadius: ".35rem",
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
                                    `)}
                                    onChange={(value, y) => {
                                        this.setState({
                                            editVal: value
                                        });
                                    }}
                                    height="300px"
                                />
                            </Col>
                        </Row>
                    </Container>
                </EditModal>
            </div>
        )
    }

}