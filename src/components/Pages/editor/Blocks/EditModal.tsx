import * as React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { X as Cross, Check } from "react-feather";
import { css, cx } from "@emotion/css";
import { BounceLoader } from "react-spinners";


type Props = {
    discardEditModal: () => void,
    closeEditModal: () => void,
    showEditModal: boolean,
    header: string,
    dark?: boolean,
    loading?: boolean,
    children?: React.ReactNode,
    id?: string
};
type State = {};

export default class EditModal extends React.Component<Props, State> {

    render() {
        return (
            <Modal
                show={this.props.showEditModal}
                centered
                style={{ fontFamily: "Jost" }}
                backdrop="static"
                className={cx(css`
                    .modal-dialog {
                        display: flex;
                        justify-content: center;
                    }
                    .modal-content{
                        border: 3px solid ${this.props.dark ? "#343434" : "#dcdcdc"};
                        border-radius: .45rem !important;
                        min-width: min(calc(100vw - 30px), 700px);
                    }
                    .modal-body{
                        border-radius: 0 0 .25rem .25rem;
                    }
                `, this.props.dark && css`
                    .modal-header {
                        background: #161616;
                        color: whitesmoke !important;
                        border-color: #343434;
                        border-radius: .25rem .25rem 0 0;
                    }
                `)}
                size="lg"
            >
                <Modal.Header style={{ padding: "15px 10px 10px 10px" }}>
                    <Modal.Title style={{ fontSize: "1.9rem", lineHeight: "60px", color: (this.props.dark ? "whitesmoke" : "grey") }}>
                        &nbsp;&nbsp;&nbsp;<span style={{ fontWeight: "bold", color: (this.props.dark ? "#999" : "black") }}>Edit |</span> {this.props.header}
                    </Modal.Title>
                    <Modal.Title style={{ float: "right" }}>
                        <Button variant="outline-danger" style={{ width: 55, height: 55, borderWidth: 3, borderRadius: ".45rem" }} onClick={this.props.discardEditModal}>
                            <Cross size={30} style={{ position: "relative", right: 2 }} />
                        </Button>
                        &nbsp;&nbsp;
                        <Button variant="outline-success" style={{ width: 55, height: 55, borderWidth: 3, borderRadius: ".45rem" }} onClick={this.props.closeEditModal}>
                            <Check size={30} style={{ position: "relative", right: 2, top: 1 }} />
                        </Button>
                        &nbsp;&nbsp;&nbsp;
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ padding: "30px 15px", background: (this.props.dark ? "black" : "#f6f7f8") }}>
                    {
                        this.props.loading ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 30, marginBottom: 30 }}>
                                <BounceLoader size={75} color={this.props.dark ? "whitesmoke" : "#666"} />
                            </div>
                        ) : (
                            <Form onSubmit={(e) => { e.preventDefault(); this.props.closeEditModal(); }}>
                                {this.props.children}
                            </Form>
                        )
                    }
                </Modal.Body>
            </Modal>
        )
    }

}