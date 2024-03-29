import { css, cx } from "@emotion/css";
import * as React from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { Hash } from "react-feather";
import BlockPanel from "./BlockPanel";
import EditModal from "./EditModal";
import { SectionData } from "./types";

type Props = {
    id: string,
    data: SectionData,
    removeBlock: (x: string) => void,
    editBlock: (x: string) => void,
    updateBlock: (x: string) => void,
    moveBlockUp: (x: string) => void,
    moveBlockDown: (x: string) => void,
    setDidEdit: () => void,
    setNoEdit: () => void,
    dark?: boolean
};

type State = {
    showEditModal: boolean
};

export default class SectionDivider extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            showEditModal: false
        }

        this.showEditModal = this.showEditModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.discardEditModal = this.discardEditModal.bind(this);
    }

    async showEditModal() {
        this.setState({ showEditModal: true });
    }

    async closeEditModal() {
        this.props.updateBlock(this.props.id);
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
                <div
                    style={{
                        width: "100%",
                        fontFamily: "Jost",
                        fontWeight: "bold",
                        fontSize: 35,
                        textAlign: "center",
                        border: this.props.dark ? "3px solid #444" : "3px solid #c4c4c4",
                        background: this.props.dark ? "#1A1A1B" : "rgba(220, 220, 220, 0.6)",
                        color: this.props.dark ? "whitesmoke" : "#333",
                        borderRadius: ".35rem",
                        padding: 20
                    }}
                >
                    <Hash size={25} color="grey" />
                    {(this.props.data as { header: string }).header}
                </div>
                <EditModal
                    header={"Section"}
                    showEditModal={this.state.showEditModal}
                    discardEditModal={this.discardEditModal}
                    closeEditModal={this.closeEditModal}
                    dark={this.props.dark}
                >
                    <Container>
                        <Row>
                            <Col>
                                <Form.Control
                                    size="lg"
                                    id={`sec-${this.props.id}`}
                                    style={{
                                        width: "100%", padding: 30, fontFamily: "Jost",
                                        resize: "none", borderRadius: ".35rem", margin: 0,
                                        border: "1px solid",
                                        borderColor: this.props.dark ? "#444" : "#dcdcdc",
                                        background: this.props.dark ? "#1A1A1B" : "white",
                                        color: this.props.dark ? "whitesmoke" : "#333"
                                    }}

                                    className={cx(css`
                                        &:focus {
                                            outline: none;
                                        }
                                    `)}
                                    defaultValue={this.props.data.header}
                                />
                            </Col>
                        </Row>
                    </Container>
                </EditModal>
            </div>
        )
    }

}