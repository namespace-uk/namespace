import * as React from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import BlockPanel from "./BlockPanel";
import EditModal from "./EditModal";
import { ImageData } from "./types";

import config from "../../../../config";
import { css, cx } from "@emotion/css";
import { Image, Upload } from "react-feather";

type Props = {
    id: string,
    data: ImageData,
    removeBlock: (x: string) => void,
    editBlock: (x: string) => void,
    updateBlock: (x: string, y: ImageData) => void,
    moveBlockUp: (x: string) => void,
    moveBlockDown: (x: string) => void,
    setDidEdit: () => void,
    setNoEdit: () => void,
    dark?: boolean
};
type State = {
    showEditModal: boolean,
    cannotLoad: boolean,
    uploadVal: [string, string] | null,
    uploading: boolean,
    dragOver?: boolean,
    captionEditVal: string
};

export default class Img extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            showEditModal: false,
            cannotLoad: false,
            uploadVal: null,
            uploading: false,
            captionEditVal: this.props.data.caption
        };

        this.reloadImg();
    }

    showEditModal = () => this.setState({ showEditModal: true });

    discardEditModal = () => this.setState({ showEditModal: false });

    // https://stackoverflow.com/questions/36280818/how-to-convert-file-to-base64-in-javascript
    toBase64 = (file: File) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    reloadImg = async () => {
        /*const url = config.endpoints.imageBucket + this.props.id;
        await fetch(url, { cache: 'reload', mode: 'no-cors' })
        .then(() => document.body.querySelectorAll(`img[src='${url}']`))
        .then(x => x.forEach((img: Element) => img.setAttribute("src", url)));*/
        this.setState({ cannotLoad: false });
    }

    closeEditModal = async () => {
        if (this.state.uploadVal !== null) {
            this.setState({ uploading: true });
            const base64 = this.state.uploadVal[1];

            await fetch(config.endpoints.uploadImage, {
                method: "POST",
                body: JSON.stringify({
                    base64: base64,
                    blockid: this.props.id
                })
            });

            await this.reloadImg();
        }

        this.props.updateBlock(this.props.id, { caption: this.state.captionEditVal });
        this.props.setDidEdit();
        this.setState({ showEditModal: false, uploading: false });
    }

    handleDragEnter = (e: React.FormEvent) => {
        e.preventDefault();
        this.setState({ dragOver: true });
    }

    handleDragLeave = () => this.setState({ dragOver: false });

    handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        this.handleDragLeave();
        let file;

        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            if (e.dataTransfer.items[0].kind === 'file') {
                file = e.dataTransfer.items[0].getAsFile();
                // console.log(`… file[${0}].name = ${file.name}`);
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            file = e.dataTransfer.files[0];
        }
        if (!file) return;
        const b64 = await this.toBase64(file) as string;
        this.setState({ uploadVal: [file.name, b64] });
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
                {
                    this.state.cannotLoad ? (
                        <div 
                            className={cx("text-center list-group-item-danger",
                                (this.props.dark && css`
                                    background: #444;
                                    color: whitesmoke;
                                `)
                            )}  
                            style={{ borderRadius: ".35rem", padding: 35.5, fontFamily: "Jost" }}
                        >
                            <Image size={17} style={{ position: "relative", bottom: 2 }}/>
                            &nbsp;
                            Could not load Image
                        </div>
                    ) : (
                        <img
                            style={{
                                width: "100%", 
                                border: this.props.dark ? "1px solid #444" : "1px solid #dcdcdc", 
                                borderRadius: ".35rem"
                            }}
                            onLoad={() => this.setState({ cannotLoad: false })}
                            onError={() => this.setState({ cannotLoad: true })}
                            alt={this.props.data.caption || "An undescribed image"}
                            src={config.endpoints.imageBucket(this.props.id)}
                            loading="lazy"
                        />
                    )
                }
                {
                    this.props.data.caption && (
                        <div style={{ display: "block", textAlign: "center", fontFamily: "Jost", padding: 5, color: this.props.dark ? "whitesmoke" : "grey", fontSize: "12pt" }}>
                            {this.props.data.caption}
                        </div>
                    )
                }
                <EditModal 
                    header={"Image"} 
                    id={this.props.id}
                    showEditModal={this.state.showEditModal} 
                    discardEditModal={this.discardEditModal} 
                    closeEditModal={this.closeEditModal}
                    dark={this.props.dark}
                    loading={this.state.uploading}
                >
                    <Container>
                        <Row>
                            <Col style={{ color: this.props.dark ? "white" : "#333" }}>
                                <Form.Group controlId="formFile" className="mb-3">
                                    <Form.Label>Upload an Image</Form.Label>
                                    <label 
                                        style={{ 
                                            height: 200, 
                                            width: "100%",
                                            borderRadius: ".35rem"
                                        }}
                                        className={cx(css`
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            &:hover {
                                                cursor: pointer;
                                            }
                                        `, this.props.dark ? css`
                                            background: #444;
                                            &:hover { background: #666; }
                                        ` : css`
                                            background: #dcdcdc;
                                            &:hover { 
                                                background: #CCC;
                                            }
                                        `, this.state.dragOver && css`
                                            outline: 3px dotted ${this.props.dark ? "black" : "#999"};
                                        `)}
                                        onDragEnter={this.handleDragEnter}
                                        onDragOver={(e: React.FormEvent) => e.preventDefault()}
                                        onDragLeave={this.handleDragLeave}
                                        onDrop={this.handleDrop}
                                    >
                                        <div 
                                            style={{ textAlign: "center" }}
                                        >
                                            {
                                                this.state.uploadVal === null ? (
                                                    <>
                                                        <Upload/>
                                                        <br/>
                                                        Drag &amp; Drop or Click to Upload
                                                    </>
                                                ) : this.state.uploadVal[0]
                                            }
                                        </div>
                                        <Form.Control 
                                            id={`file-${this.props.id}`} 
                                            type="file" accept="image/jpeg"
                                            onChange={async (e) => this.setState({ 
                                                uploadVal: [
                                                    e.target.value, 
                                                    // @ts-ignore 
                                                    (await this.toBase64(e.target.files[0])) as string
                                                ]
                                            })}
                                            hidden
                                        />
                                    </label>
                                </Form.Group>
                                <hr/>
                                <Form.Group>
                                    <Form.Label>Caption</Form.Label>
                                    <Form.Control 
                                        // id={`cpn-${this.props.id}`} 
                                        value={this.state.captionEditVal}
                                        style={{
                                            borderColor: this.props.dark ? "#444" : "#dcdcdc",
                                            background: this.props.dark ? "#1A1A1B" : "white",
                                            color: this.props.dark ? "whitesmoke" : "#333"
                                        }}
                                        onChange={e => this.setState({ captionEditVal: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Container>
                </EditModal>
            </div>
        )
    }

}