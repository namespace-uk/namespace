import * as React from "react";
import { Form } from "react-bootstrap";
import { ExternalLink } from "react-feather";
import BlockPanel from "./BlockPanel";
import EditModal from "./EditModal";
import { EmbedData } from "./types";
import { css, cx } from "@emotion/css";

type Props = {
    id: string,
    data: EmbedData,
    removeBlock: (x: string) => void,
    editBlock: (x: string) => void,
    updateBlock: (x: string) => void,
    moveBlockUp: (x: string) => void,
    moveBlockDown: (x: string) => void,
    setDidEdit: () => void,
    setNoEdit: () => void
};
type State = {
    showEditModal: boolean,
    editCaption: string | undefined
};

export default class Embed extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            showEditModal: false,
            editCaption: this.props.data.caption
        };

        this.showEditModal = this.showEditModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.discardEditModal = this.discardEditModal.bind(this);
        this.updateEditCaption = this.updateEditCaption.bind(this);
    }

    showEditModal() {
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

    updateEditCaption(e: { target: { value: any; }; }) {
        const caption = e.target.value;
        if ((caption as string).length <= 100) {
            this.setState({ editCaption: caption });
        }
    }

    render() {
        return (
            <>
                <BlockPanel
                    id={this.props.id}
                    showEditModal={this.showEditModal}
                    removeBlock={this.props.removeBlock}
                    editBlock={this.props.editBlock}
                    moveBlockUp={this.props.moveBlockUp}
                    moveBlockDown={this.props.moveBlockDown}
                    setDidEdit={this.props.setDidEdit}
                    blockName="Embed"
                />
                <figure>
                    <div
                        style={{
                            width: "100%",
                            border: "1px solid #dcdcdc",
                            borderBottom: 0,
                            borderTopRightRadius: ".35rem",
                            borderTopLeftRadius: ".35rem",
                            background: "white",
                            padding: "5px 6px"
                        }}
                    >
                        &nbsp;
                        <ExternalLink
                            style={{ padding: 5, borderRadius: ".35rem" }}
                            size={25}
                        />
                        &nbsp;
                        <span className="text-muted" style={{ fontFamily: "Jost", position: "relative", top: 1, fontSize: "11pt", wordBreak: "break-all" }}>
                            {this.props.data.caption || "Embed"}
                        </span>
                    </div>
                    <iframe
                        title={this.props.id}
                        src={this.props.data.link}
                        style={{
                            width: "100%", border: "1px solid #dcdcdc",
                            borderRadius: ".35rem", height: 600,
                            borderTopRightRadius: 0,
                            borderTopLeftRadius: 0
                        }}
                    />
                </figure>
                <EditModal
                    header={"Embed"}
                    showEditModal={this.state.showEditModal}
                    discardEditModal={this.discardEditModal}
                    closeEditModal={this.closeEditModal}
                >
                    <Form>
                        <Form.Group>
                            <Form.Label>URL</Form.Label>
                            <Form.Control
                                id={`ebd-link-${this.props.id}`}
                                style={{
                                    width: "100%", padding: 30, fontFamily: "Jost",
                                    resize: "none", borderRadius: ".35rem", margin: 0,
                                    border: "1px solid #DCDCDC"
                                }}

                                className={cx(css`
                                    &:focus {
                                        outline: none;
                                    }
                                `)}
                                defaultValue={this.props.data.link}
                                placeholder="https://foo.bar.com"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Caption</Form.Label>
                            <Form.Control
                                id={`ebd-capt-${this.props.id}`}
                                style={{
                                    width: "100%", padding: 30, fontFamily: "Jost",
                                    resize: "none", borderRadius: ".35rem", margin: 0,
                                    border: "1px solid #DCDCDC"
                                }}

                                className={cx(css`
                                    &:focus {
                                        outline: none;
                                    }
                                `)}
                                value={this.state.editCaption}
                                onChange={this.updateEditCaption}
                                placeholder="A really cool website!"
                            />
                        </Form.Group>
                        <Form.Text>
                            {this.state.editCaption?.length}/100
                        </Form.Text>
                    </Form>
                    <br />
                    <fieldset style={{
                        border: "3px solid #dcdcdc",
                        borderRadius: ".35rem",
                        padding: "10px 20px 15px 20px",
                        fontFamily: "Jost"
                    }}>
                        <legend style={{ width: "auto", fontSize: "14pt", marginBottom: 0 }}>&nbsp;Settings&nbsp;</legend>

                        Limit Height
                    </fieldset>
                </EditModal>
            </>
        )
    }

}