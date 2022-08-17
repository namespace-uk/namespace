import React from "react";
import { Link, Prompt, Redirect, RouteComponentProps } from "react-router-dom";

import { css, cx } from "@emotion/css";
import CStyles from "../../common/common_styles";
import LocationCard from "../../common/location_card";
import Template from "../../common/template";
import { Row, Col, Button, Modal, Container, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Edit, Image, Code, Type, Trash2, Save, Edit3, AlignJustify, Eye, EyeOff } from "react-feather";
import ProfileCard from "../../common/profile_card/profile_card";

import $ from "jquery";
import TextBlock from "./Blocks/TextBlock";
import { CodeBlockData, EmbedData, ImageData, KaTeXData, SectionData, TextData } from "./Blocks/types";
import UserHandler from "../../common/UserHandler";
import { CognitoUser } from "amazon-cognito-identity-js";
import KaTeX from "./Blocks/KaTeXBlock";
import SectionDivider from "./Blocks/SectionDivider";
import Embed from "./Blocks/Embed";
import CodeBlock from "./Blocks/CodeBlock";
import { BounceLoader, PulseLoader } from "react-spinners";
import Img from "./Blocks/Img";
import BlockRenderer from "../guide/BlockRenderer";
import config from "../../../config";
import EditModal from "./Blocks/EditModal";
import PageBP from "../../common/PageBP/PageBP";
import { Footnote } from "../../common/footnote";
const { v4: uuidv4 } = require("uuid");

interface MatchParams {
    id: string;
}

type Block = {
    id: string,
    type: string,
    data: Object
}

type Guide = {
    id: string,
    blocks: Block[],
    header: string,
    description: string,
    timestamp: Date,
    user: string,
    likes: number,
    isPrivate: boolean
};

interface Props extends RouteComponentProps<MatchParams> { };
type State = {
    dark: boolean,
    guide: Guide | null,
    didEdit: boolean,
    currentlyEditing: string | null,
    showHeaderEditModal: boolean,
    headerEditModalValues: any,
    user: CognitoUser | null,
    redirectTo: string | null,
    newBlockId?: string,
    hasLoaded: boolean,
    showDeleteModal: boolean,
    deleting: boolean,
    editing: boolean,
    saving: boolean,
    showBlocks: ({
        type: string,
        data: any,
        id: string
    })[]
};

export default class Editor extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: this.localStorage!.getItem("darkmode") === "true",
            guide: null,
            didEdit: false,
            currentlyEditing: null,
            showHeaderEditModal: false,
            headerEditModalValues: {},
            user: null,
            redirectTo: null,
            hasLoaded: false,
            showDeleteModal: false,
            deleting: false,
            editing: true,
            saving: false,
            showBlocks: []
        };

        this.init();

        // Binding
        this.setDidEdit = this.setDidEdit.bind(this);
        this.setNoEdit = this.setNoEdit.bind(this);
        this.removeBlock = this.removeBlock.bind(this);
        this.editBlock = this.editBlock.bind(this);
        this.updateBlock = this.updateBlock.bind(this);
        this.updateBlockParamaterized = this.updateBlockParamaterized.bind(this);
        this.moveBlockUp = this.moveBlockUp.bind(this);
        this.moveBlockDown = this.moveBlockDown.bind(this);
        this.addTextBlock = this.addTextBlock.bind(this);
        this.addBlock = this.addBlock.bind(this);
        this.addImageBlock = this.addImageBlock.bind(this);
        this.addKatexBlock = this.addKatexBlock.bind(this);
        this.addCodeBlock = this.addCodeBlock.bind(this);
        this.addSection = this.addSection.bind(this);
        this.addEmbed = this.addEmbed.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.openHeaderEditModal = this.openHeaderEditModal.bind(this);
        this.discardHeaderEditModal = this.discardHeaderEditModal.bind(this);
        this.closeHeaderEditModal = this.closeHeaderEditModal.bind(this);
        this.updateHeaderEditValues = this.updateHeaderEditValues.bind(this);
        this.showPreview = this.showPreview.bind(this);
        this.setDarkMode = this.setDarkMode.bind(this);
    }

    init() {
        fetch(`${config.endpoints.getGuide(this.props.match.params.id)}?disablev=true`)
            .then(res => {
                if (res.status !== 200) return Promise.reject(res);
                return res.json();
            })
            .then(data => {
                const guide = {
                    id: data.id,
                    header: data.header,
                    description: data.description,
                    timestamp: new Date(data.timestamp),
                    blocks: data.blocks,
                    user: data.user,
                    likes: data.likes ?? 0,
                    isPrivate: data.isPrivate ?? false
                };

                console.log(guide);
                console.log(data);
                const user = (new UserHandler()).getUser();
                if (user == null || (data.id && user.getUsername() !== guide?.user)) this.setState({ redirectTo: "/" });
                else if (data.id) this.setState({ user: user, guide: guide, hasLoaded: true }, this.forceUpdate);
            })
    }

    async removeBlock(blockid: string) {
        const guide = this.state.guide;
        if (guide != null)
            guide.blocks = guide.blocks.filter(x => x.id !== blockid);
        this.setState({ guide: guide, didEdit: true });
    }

    setDidEdit = async () => this.setState({ didEdit: true });

    deleteGuide = () => {
        const guide = this.state.guide;
        if (guide == null) return;

        fetch(config.endpoints.deleteGuide(guide.id), {
            method: "DELETE"
        }).then(res => {
            this.setState({
                guide: null,
                redirectTo: `/user/${this.state.user?.getUsername()}`
            });
        });
    }

    updateBlock(blockid: string) {
        const guide = this.state.guide;
        if (guide == null) return;

        for (const b of guide.blocks) {
            if (b.id === blockid) {
                if (b.type === "text") {
                    (b.data as TextData).text = $(`#txt-${blockid}`).val() as string;
                } else if (b.type === "katex") {
                    (b.data as KaTeXData).code = $(`#ktx-${blockid}`).val() as string;
                } else if (b.type === "section") {
                    (b.data as SectionData).header = $(`#sec-${blockid}`).val() as string;
                } else if (b.type === "img") {
                    (b.data as ImageData).caption = $(`#cpn-${blockid}`).val() as string;
                    console.log((b.data as ImageData).caption);
                } else if (b.type === "embed") {
                    (b.data as EmbedData) = {
                        link: $(`#ebd-link-${blockid}`).val() as string,
                        caption: $(`#ebd-capt-${blockid}`).val() as string
                    };
                }
                this.setState({ guide: guide });
                this.setDidEdit();
                break;
            }
        }
    }

    updateBlockParamaterized<T>(blockid: string, value: T) {
        const guide = this.state.guide;
        if (guide == null) return;

        for (const b of guide.blocks) {
            if (b.id === blockid) {
                (b.data as T) = value;
                this.setState({ guide: guide });
                this.setDidEdit();
                break;
            }
        }
    }

    async applyChanges() {
        this.setState({ saving: true });
        const guide = this.state.guide;
        if (guide == null) return;
        guide.timestamp = new Date();
        await fetch(config.endpoints.updateGuide, {
            method: "POST",
            body: JSON.stringify(guide)
        }).then(() => {
            this.setState({ didEdit: false, saving: false });
        });
    }

    async editBlock(blockid: string) {
        this.setState({ currentlyEditing: blockid });
    }

    isModalOpen(blockid: string): boolean {
        return (this.state.currentlyEditing === blockid);
    }

    async setNoEdit() {
        this.setState({ currentlyEditing: null });
    }

    toggleVisibility() {
        const guide = this.state.guide;
        if (guide == null) return;

        guide.isPrivate = !!!guide.isPrivate;
        this.setState({
            guide: guide,
            didEdit: true
        });
    }

    moveBlockUp(blockid: string) {
        const guide = this.state.guide;
        if (guide == null || guide.blocks[0].id === blockid) return;

        const blocks = guide?.blocks;
        for (var i = 1; i < blocks.length; i++) {
            let current = blocks[i];
            if (current.id === blockid) {
                let tmp = blocks[i - 1];
                blocks[i - 1] = current;
                blocks[i] = tmp;
                guide.blocks = blocks;
                this.setState({ guide: guide });
                break;
            }
        }

        this.setDidEdit();
    }

    moveBlockDown(blockid: string) {
        const guide = this.state.guide;
        if (guide == null) return;

        const blocks = guide.blocks;
        for (var i = 0; i < blocks.length - 1; i++) {
            let current = blocks[i];
            if (current.id === blockid) {
                let tmp = blocks[i + 1];
                blocks[i + 1] = current;
                blocks[i] = tmp;
                guide.blocks = blocks;
                this.setState({ guide: guide });
                break;
            }
        }

        this.setDidEdit();
    }

    async addBlock(type: string, data: any, after?: string, scrollAfter?: boolean) {
        const guide = this.state.guide;
        if (guide == null) return;

        // Generate id for block
        const id = uuidv4();
        const block = {
            id: id,
            type: type,
            data: data
        };

        if (after) {
            // If the block is not the last
            // Insert in the correct position
            guide.blocks.splice(
                guide.blocks.findIndex(x => x.id === after),
                0,
                block
            );
        } else {
            // Otherwise, add to the end
            guide.blocks.push(block);
        }

        this.setState({
            guide: guide,
            didEdit: true,
            newBlockId: id
        }, () => {
            if (!after) {
                $(`#edit-${id}`).trigger('click');
            }
            if (scrollAfter) {
                window.scrollTo(0, document.body.scrollHeight);
            }
        });
    }

    async addTextBlock(after?: string, scrollAfter?: boolean) {
        this.addBlock("text", {
            text: "",
            type: "markdown"
        }, after, scrollAfter);
    }

    addKatexBlock = async (after?: string, scrollAfter?: boolean) => {
        this.addBlock("katex", {
            code: ""
        }, after, scrollAfter);
    }

    addImageBlock = async (after?: string, scrollAfter?: boolean) => {
        this.addBlock("img", {
            caption: ""
        }, after, scrollAfter);
    }

    async addCodeBlock(after?: string, scrollAfter?: boolean) {
        this.addBlock("code", {
            code: "Type here",
            lang: "plain"
        }, after, scrollAfter);
    }

    async addSection(after?: string, scrollAfter?: boolean) {
        this.addBlock("section", {
            header: "New Section"
        }, after, scrollAfter);
    }

    async addEmbed(after?: string, scrollAfter?: boolean) {
        this.addBlock("embed", {
            link: "",
            caption: ""
        }, after, scrollAfter);
    }

    openHeaderEditModal() {
        this.setState({
            showHeaderEditModal: true,
            headerEditModalValues: {
                header: this.state.guide?.header,
                description: this.state.guide?.description
            }
        });
    }

    closeHeaderEditModal() {
        const guide = this.state.guide;
        if (guide == null) return;

        guide.header = this.state.headerEditModalValues.header;
        guide.description = this.state.headerEditModalValues.description;

        this.setState({
            showHeaderEditModal: false,
            guide: guide,
            didEdit: true
        });
    }

    discardHeaderEditModal() {
        this.setState({
            showHeaderEditModal: false
        });
    }

    updateHeaderEditValues() {
        this.setState({
            headerEditModalValues: {
                header: $("#edit-title").val(),
                description: $("#edit-desc").val()
            }
        });
    }

    componentDidUpdate() {
        window.onbeforeunload = this.state.didEdit ? () => true : null;
    }

    componentWillUnmount() {
        window.onbeforeunload = null;
    }

    showPreview() {
        if (!this.state.guide) return;

        const blocks = this.state.guide?.blocks;
        let showBlocks = [];
        let accum = [];
        for (let i = 0; i < blocks.length; i++) {
            const current = blocks[i];
            const next = blocks[i + 1];
            if (current.type === "text") {
                accum.push(current);
                if (next === undefined || !(next.type === "text" && (next.data as TextData).type === (current.data as TextData).type)) {
                    showBlocks.push({
                        type: "textseq",
                        data: {
                            text: accum.map(x => (x.data as TextData).text),
                            type: (accum[0].data as TextData).type
                        },
                        id: accum[0].id
                    });
                    accum = [];
                };
            } else if (current.type === "katex") {
                accum.push(current);
                if (next === undefined || !(next.type === "katex")) {
                    showBlocks.push({
                        type: "katexseq",
                        data: accum.map(x => (x.data as KaTeXData).code),
                        id: accum[0].id
                    });
                    accum = [];
                };
            } else showBlocks.push(current);
        }

        this.setState({
            editing: false,
            showBlocks: showBlocks
        });
    }

    render() {
        if (!this.state.hasLoaded) return;

        if (this.state.guide == null) return this.state.redirectTo ? <Redirect to={this.state.redirectTo} /> : (
            <Template dark={this.state.dark} user={this.state.user} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                <Row>
                    <Col md={3} />
                    <Col md={6}>
                        <LocationCard dark={this.state.dark}>
                            <Edit size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Edit</strong>
                        </LocationCard>
                        <br />
                        <div
                            className={cx("text-center list-group-item-secondary",
                                (this.state.dark && css`
                                    background: #343434;
                                    color: whitesmoke;
                                `)
                            )}
                            style={{ borderRadius: ".35rem", padding: "50px 40px", fontFamily: "Jost" }}>
                            Could not find this Guide
                            <br /><br />
                            <Link to="/" style={{ textDecoration: "underline", color: this.state.dark ? "whitesmoke" : undefined }}>Return to Home</Link>
                        </div>
                    </Col>
                    <Col md={3} />
                </Row>
            </Template>
        )

        const locationBtnStyle = css`
            font-size: 10pt;
            padding: 5px 10px;
            border-radius: .35rem;
            position: relative;
            bottom: 2px;
            ${this.state.dark && "color: whitesmoke;"}
        `;
        const locationBtnStyleActive = css`
            background: ${this.state.dark ? "black" : "whitesmoke"};
        `
        const locationBtnStyleInctive = css`
            &:hover { 
                background: ${this.state.dark ? "black" : "whitesmoke"};
                cursor: pointer;
            }
        `;

        const addBlockPanel = (label: string) => (
            <fieldset
                style={{
                    border: "3px solid",
                    borderRadius: ".55rem",
                    padding: "5px 10px 10px",
                    fontFamily: "Jost",
                    borderColor: (this.state.dark ? "#343434" : "#dcdcdc"),
                    color: (this.state.dark ? "whitesmoke" : "black"),
                    background: this.state.dark ? "#161616" : "white"
                }}
            >
                <legend style={{ width: "auto", fontSize: "14pt", marginBottom: 0 }}>
                    &nbsp;{label}&nbsp;
                </legend>
                <div
                    style={{
                        width: "100%",
                        borderRadius: ".35rem",
                        padding: 10
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            flexWrap: "wrap",
                            gap: 10
                        }}
                    >
                        {
                            [
                                { type: "text", tooltip: "Paragraph", icon: (<AlignJustify size={25} />), fn: this.addTextBlock },
                                {
                                    type: "katex", tooltip: "KaTeX Block", icon: (
                                        <svg viewBox="0 0 1200 500" style={{ width: 36, height: "auto" }}>
                                            <path d="m5.46 4.23h-.25c-.1 1.02-.24 2.26-2 2.26h-.81c-.47 0-.49-.07-.49-.4v-5.31c0-.34 0-.48.94-.48h.33v-.3c-.36.03-1.26.03-1.67.03-.39 0-1.17 0-1.51-.03v.3h.23c.77 0 .79.11.79.47v5.25c0 .36-.02.47-.79.47h-.23v.31h5.19z" transform="matrix(45 0 0 45 40 47.65)" />
                                            <path d="m2.81.16c-.04-.12-.06-.16-.19-.16s-.16.04-.2.16l-1.61 4.08c-.07.17-.19.48-.81.48v.25h1.55v-.25c-.31 0-.5-.14-.5-.34 0-.05.01-.07.03-.14 0 0 .34-.86.34-.86h1.98l.4 1.02c.02.04.04.09.04.12 0 .2-.38.2-.57.2v.25h1.97v-.25h-.14c-.47 0-.52-.07-.59-.27 0 0-1.7-4.29-1.7-4.29zm-.4.71.89 2.26h-1.78z" transform="matrix(45 0 0 45 151.6 40)" />
                                            <path d="m6.27 0h-6.09s-.18 2.24-.18 2.24h.24c.14-1.61.29-1.94 1.8-1.94.18 0 .44 0 .54.02.21.04.21.15.21.38v5.25c0 .34 0 .48-1.05.48h-.4v.31c.41-.03 1.42-.03 1.88-.03s1.49 0 1.9.03v-.31h-.4c-1.05 0-1.05-.14-1.05-.48v-5.25c0-.2 0-.34.18-.38.11-.02.38-.02.57-.02 1.5 0 1.65.33 1.79 1.94h.25s-.19-2.24-.19-2.24z" transform="matrix(45 0 0 45 356.35 50.35)" />
                                            <path d="m6.16 4.2h-.25c-.25 1.53-.48 2.26-2.19 2.26h-1.32c-.47 0-.49-.07-.49-.4v-2.66h.89c.97 0 1.08.32 1.08 1.17h.25v-2.64h-.25c0 .85-.11 1.16-1.08 1.16h-.89v-2.39c0-.33.02-.4.49-.4h1.28c1.53 0 1.79.55 1.95 1.94h.25l-.28-2.24h-5.6v.3h.23c.77 0 .79.11.79.47v5.22c0 .36-.02.47-.79.47h-.23v.31h5.74z" transform="matrix(45 0 0 45 602.5 150.25)" />
                                            <path d="m3.76 2.95 1.37-2c.21-.32.55-.64 1.44-.65v-.3h-2.38v.3c.4.01.62.23.62.46 0 .1-.02.12-.09.23 0 0-1.14 1.68-1.14 1.68l-1.28-1.92c-.02-.03-.07-.11-.07-.15 0-.12.22-.29.64-.3v-.3c-.34.03-1.07.03-1.45.03-.31 0-.93-.01-1.3-.03v.3h.19c.55 0 .74.07.93.35 0 0 1.83 2.77 1.83 2.77l-1.63 2.41c-.14.2-.44.66-1.44.66v.31h2.38v-.31c-.46-.01-.63-.28-.63-.46 0-.09.03-.13.1-.24l1.41-2.09 1.58 2.38c.02.04.05.08.05.11 0 .12-.22.29-.65.3v.31c.35-.03 1.08-.03 1.45-.03.42 0 .88.01 1.3.03v-.31h-.19c-.52 0-.73-.05-.94-.36 0 0-2.1-3.18-2.1-3.18z" transform="matrix(45 0 0 45 845.95 47.65)" />
                                        </svg>
                                    ), fn: this.addKatexBlock
                                },
                                { type: "img", tooltip: "Image", icon: (<Image size={25} />), fn: this.addImageBlock },
                                { type: "code", tooltip: "Code Block", icon: (<Code size={25} />), fn: this.addCodeBlock },
                                { type: "section", tooltip: "Subtitle", icon: (<Type size={25} />), fn: this.addSection },
                                // { type: "embed"  , tooltip: "Embed"      , icon: (<LinkIcon size={25}/>)  , fn: this.addEmbed }
                            ].map(x => (
                                <OverlayTrigger
                                    key={`k-new-block-${x.type}`}
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id={`new-block-${x.type}-tooltip`}>
                                            {x.tooltip}
                                        </Tooltip>
                                    }
                                >
                                    <Button
                                        variant="outline-secondary"
                                        style={{
                                            flexGrow: 65, height: 64
                                        }}
                                        className={cx(PageBP.Styles.button(this.state.dark), css`
                                                            & > svg { 
                                                                color: ${this.state.dark ? "whitesmoke" : ""}; 
                                                                ${x.type === "katex" && (
                                                this.state.dark ? "fill: white" : "fill: #444"
                                            )};
                                                            }
                                                        `)}
                                        onClick={() => { x.fn(undefined, true); }}
                                    >
                                        {x.icon}
                                    </Button>
                                </OverlayTrigger>
                            ))
                        }
                    </div>
                </div>
            </fieldset>
        );

        return (
            <Template user={this.state.user} dark={this.state.dark} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                <Prompt
                    when={this.state.didEdit}
                    message='You have unsaved changes, are you sure you want to leave?'
                />
                <Row>
                    <Col md={8} sm={12}>
                        <LocationCard dark={this.state.dark}>
                            <Edit size={14} style={{ position: 'relative', bottom: 3 }} />&nbsp;
                            <strong>Edit</strong>
                            <span style={{ float: "right" }}>
                                <span
                                    className={cx(locationBtnStyle, !this.state.editing ? locationBtnStyleInctive : locationBtnStyleActive)}
                                    onClick={!this.state.editing ? (() => { this.setState({ editing: true }); }) : undefined}
                                >
                                    Edit
                                </span>
                                &nbsp;
                                <span
                                    className={cx(locationBtnStyle, this.state.editing ? locationBtnStyleInctive : locationBtnStyleActive)}
                                    onClick={this.state.editing ? this.showPreview : undefined}
                                >
                                    Preview
                                </span>
                            </span>
                        </LocationCard>
                        <br />
                        <div>
                            <div hidden={!this.state.editing || true}
                                style={{
                                    position: "absolute", left: -45,
                                    fontFamily: "Jost", padding: 6,
                                    background: this.state.dark ? "#161616" : "white",
                                    border: this.state.dark ? "none" : "1px solid #dcdcdc",
                                    borderRadius: ".7rem"
                                }}>
                                <Button
                                    /*variant="outline-primary"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        fontVariant: "small-caps",
                                        fontSize: "1.1rem",
                                        borderRadius: ".35rem",
                                        borderWidth: "2px",
                                        transitionDuration: "0s"
                                    }}
                                    className={cx(css`
                                        &:not(:hover) {
                                            background: ${this.state.dark ? "#161616" : "white"};
                                        }
                                        @media(max-width: 992px) {
                                            display: none;
                                        }
                                    `)}*/
                                    style={{
                                        width: 40,
                                        height: 40
                                    }}
                                    className={PageBP.Styles.button(this.state.dark)}
                                    onClick={this.openHeaderEditModal}
                                >
                                    <Edit3 size={20} style={{ position: "relative", bottom: 2, right: 3 }} />
                                </Button>
                            </div>
                            <div
                                style={{
                                    background: (this.state.dark ? "#161616" : "white"),
                                    color: (this.state.dark ? "whitesmoke" : "black"),
                                    border: "3px solid",
                                    borderColor: (this.state.dark ? "#343434" : "#dcdcdc"),
                                    borderRadius: ".55rem"
                                }}
                            >
                                <div style={{ padding: 30 }}>
                                    <h3
                                        style={{ fontFamily: "Jost, sans-serif", fontWeight: "bold", color: (this.state.dark ? "whitesmoke" : "#333") }}
                                    >
                                        {this.state.guide.header}
                                    </h3>
                                    <h6 style={{ color: "#666", fontFamily: "Jost" }}>
                                        {this.state.guide.timestamp.toDateString()}
                                    </h6>
                                    {
                                        this.state.guide.description && (
                                            <>
                                                <br />
                                                <p style={{ margin: 0, wordBreak: "break-word", overflow: "hidden", fontFamily: "Jost" }}>
                                                    {this.state.guide.description}
                                                </p>
                                            </>
                                        )
                                    }
                                </div>
                                <div
                                    hidden={!this.state.editing}
                                    style={{
                                        fontFamily: "Jost", padding: "10px 15px", borderTop: "1px solid",
                                        borderColor: this.state.dark ? "#343434" : "#dcdcdc",
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "baseline"
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "14pt",
                                            color: "gray",
                                            marginLeft: 10
                                        }}
                                    >
                                        Title
                                    </span>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            float: "right"
                                        }}
                                    >
                                        <Button variant="light" size="sm"
                                            style={{
                                                borderRadius: ".35rem", border: "3px solid",
                                                paddingBottom: 2,
                                                fontWeight: "bold", color: "whitesmoke",
                                                borderColor: "#238636", background: "#238636" // this.state.dark ? "#343434" : "#dcdcdc"
                                            }}
                                            className={cx(css`
                                                background: ${this.state.dark ? "#161616" : "white"};
                                            `, css`
                                                &:hover {
                                                    background: var(--success) !important;
                                                    border-color: var(--success) !important;
                                                }
                                            `)}
                                            onClick={this.openHeaderEditModal}
                                        >
                                            <Edit3 size={17} style={{ position: "relative", bottom: 3 }} />
                                            &nbsp;&nbsp;
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 25 }} hidden={this.state.editing} />
                        {
                            !this.state.editing && BlockRenderer.render(this.state.showBlocks, this.state.dark)
                        }
                        {
                            this.state.guide.blocks.length === 0 && (
                                <div style={{ marginTop: 25 }}>
                                    {addBlockPanel("Choose your first block")}
                                </div>
                            )
                        }
                        {
                            this.state.editing && this.state.guide.blocks.map(x => [
                                (
                                    <div
                                        style={{ display: "flex", justifyContent: "center", padding: 5, borderRadius: ".35rem", fontFamily: "Jost" }}
                                        className={cx(css`
                                        transition: all .3s;
                                        transition-delay: .1s;
                                        span {
                                            visibility: hidden;
                                            transition: 0s;
                                            transition-delay: .2s;
                                            transition-property: visibility;
                                        }
                                        &:not(:hover) {
                                            height: 25px;
                                        }
                                        &:hover { 
                                            height: 40px;
                                            /*cursor: pointer;
                                            background: rgba(0, 0, 0, 0.1);*/
                                            transition-delay: 0s;
                                            span {
                                                visibility: visible;
                                                transition-delay: .1s;
                                            }
                                        }
                                    `)}
                                    >
                                        {
                                            [
                                                { type: "text", tooltip: "Paragraph", fn: this.addTextBlock },
                                                { type: "katex", tooltip: "KaTeX Block", fn: this.addKatexBlock },
                                                { type: "img", tooltip: "Image", fn: this.addImageBlock },
                                                { type: "code", tooltip: "Code Block", fn: this.addCodeBlock },
                                                { type: "section", tooltip: "Subtitle", fn: this.addSection },
                                                // { type: "embed"  , tooltip: "Embed"      , fn: this.addEmbed }
                                            ].map(y => (
                                                <span
                                                    className={cx(PageBP.Styles.button(this.state.dark, !this.state.dark), css`
                                                        transition: all .25s;
                                                        padding: 5px;
                                                        font-size: 10pt;
                                                        &:hover {
                                                            cursor: pointer;
                                                        }
                                                    `)}
                                                    onClick={() => { y.fn(x.id); }}
                                                >
                                                    &nbsp;{y.tooltip}&nbsp;
                                                </span>
                                            )).map(x => [x, <>&nbsp;&nbsp;</>])
                                        }
                                    </div>
                                ),
                                (() => {
                                    const props: any = {
                                        id: x.id,
                                        removeBlock: this.removeBlock,
                                        updateBlock: this.updateBlock,
                                        editBlock: this.editBlock,
                                        moveBlockDown: this.moveBlockDown,
                                        moveBlockUp: this.moveBlockUp,
                                        setDidEdit: this.setNoEdit,
                                        setNoEdit: this.setNoEdit,
                                        dark: this.state.dark,
                                        key: x.id
                                    };
                                    switch (x.type) {
                                        case "text": {
                                            props.updateBlock = this.updateBlockParamaterized;
                                            return (
                                                <TextBlock
                                                    data={x.data as TextData}
                                                    {...props}
                                                />
                                            );
                                        }
                                        case "katex": {
                                            props.updateBlock = this.updateBlockParamaterized;
                                            return (
                                                <KaTeX
                                                    data={x.data as KaTeXData}
                                                    {...props}
                                                />
                                            );
                                        }
                                        case "img": {
                                            props.updateBlock = this.updateBlockParamaterized;
                                            return (
                                                <Img
                                                    data={x.data as ImageData}
                                                    {...props}
                                                />
                                            )
                                        }
                                        case "section": return (
                                            <SectionDivider
                                                data={x.data as SectionData}
                                                {...props}
                                            />
                                        );
                                        case "code": {
                                            props.updateBlock = this.updateBlockParamaterized;
                                            return (
                                                <CodeBlock
                                                    data={x.data as CodeBlockData}
                                                    {...props}
                                                />
                                            );
                                        }
                                        case "embed": return (
                                            <Embed
                                                data={x.data as EmbedData}
                                                {...props}
                                            />
                                        )
                                        default: return (<br />);
                                    }
                                })()
                            ])
                        }
                        <div style={{ maxWidth: "calc(100vw - 30px)" }}>
                            <div hidden={!this.state.editing}>
                                <div
                                    hidden
                                    style={{
                                        width: "100%",
                                        border: "3px solid #dcdcdc",
                                        borderBottom: 0,
                                        borderTopRightRadius: ".35rem",
                                        borderTopLeftRadius: ".35rem",
                                        background: this.state.dark ? "#161616" : "white",
                                        padding: "5px 40px",
                                        fontFamily: "Jost",
                                        // textAlign: "center",
                                        fontWeight: "bold",
                                        fontSize: "14pt",
                                        color: this.state.dark ? "white" : "var(--secondary)"
                                    }}
                                >
                                    &nbsp;
                                    Add a Block
                                </div>
                            </div>
                        </div>
                        <br />
                    </Col>
                    <Col md={4} sm={0} className={cx(CStyles.small_col_s)}>
                        <ProfileCard
                            user={this.state.user}
                            hasLoaded={this.state.hasLoaded}
                            dark={this.state.dark}
                            localStorage={this.localStorage!}
                        />
                        <br />
                        <div style={{ position: "sticky", top: 25 }}>
                            <fieldset
                                style={{
                                    border: "3px solid",
                                    borderRadius: ".55rem",
                                    padding: "10px 20px 20px",
                                    fontFamily: "Jost",
                                    borderColor: (this.state.dark ? "#343434" : "#dcdcdc"),
                                    color: (this.state.dark ? "whitesmoke" : "black"),
                                    background: this.state.dark ? "#161616" : "white"
                                }}
                            >
                                <legend style={{ width: "auto", fontSize: "14pt", marginBottom: 0 }}>&nbsp;Controls&nbsp;</legend>
                                <Button
                                    variant={!this.state.dark && false ? "outline-secondary" : undefined}
                                    style={{
                                        ...{ width: "100%", display: "block" },
                                        ...(!this.state.dark && false ? {
                                            borderRadius: ".35rem",
                                            borderWidth: "3px",
                                            transition: "background 0s"
                                        } : {})
                                    }}
                                    className={!this.state.dark && false ?
                                        cx() //cx(css`background: ${this.state.dark ? "#161616" : "white"};`)
                                        : PageBP.Styles.button(this.state.dark, false, "danger")
                                    }
                                    onClick={() => { this.setState({ showDeleteModal: true }) }}
                                >
                                    <Trash2 size={17} style={{ position: "relative", bottom: 2 }} />
                                    &nbsp;
                                    Delete Guide
                                </Button>
                                <Button
                                    style={{ width: "100%", display: "block", marginTop: 10, border: "1px solid #666;" }}
                                    className={PageBP.Styles.button(this.state.dark)}
                                    onClick={this.toggleVisibility}
                                >
                                    {
                                        this.state.guide.isPrivate !== true ? (
                                            <>
                                                <Eye size={17} style={{ position: "relative", bottom: 2 }} />
                                                &nbsp;
                                                Public
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff size={17} style={{ position: "relative", bottom: 2 }} />
                                                &nbsp;
                                                Private
                                            </>
                                        )
                                    }
                                </Button>
                                {
                                    this.state.didEdit ? (
                                        <Button
                                            variant="outline-danger"
                                            style={{ width: "100%", display: "block", borderRadius: ".35rem", borderWidth: "3px", marginTop: 10, transition: "background 0s" }}
                                            className={cx(css`background: ${this.state.dark ? "#161616" : "white"};`)}
                                            onClick={() => this.applyChanges()}
                                            disabled={this.state.saving}
                                        >
                                            {this.state.saving ? (<PulseLoader size={8} color="var(--danger)" />) : (
                                                <>
                                                    <Save size={17} style={{ position: "relative", bottom: 2 }} />
                                                    &nbsp;
                                                    Save Guide
                                                </>
                                            )}
                                        </Button>
                                    ) : null
                                }
                            </fieldset>
                            <br />
                            {this.state.guide.blocks.length !== 0 && addBlockPanel("Append a Block")}
                            <Footnote dark={this.state.dark} />
                        </div>
                        <Modal
                            show={this.state.showDeleteModal}
                            size="sm"
                            style={{ fontFamily: "Jost" }}
                            className={cx(css`
                                .modal-content{
                                    border: 5px solid ${this.state.dark ? "#343434" : "#dcdcdc"};
                                    borderRadius: 0.35rem;
                                }
                            `)}
                            centered
                        >
                            <Modal.Body
                                style={{ fontSize: "16pt" }}
                                className={cx(this.state.dark && css`
                                    background: #161616;
                                    color: whitesmoke;
                                `)}
                            >
                                {
                                    this.state.deleting ? (
                                        <div style={{ height: 40, width: 40, marginTop: 10, marginBottom: 10, display: "table", marginLeft: "auto", marginRight: "auto" }}>
                                            <BounceLoader loading={true} color={this.state.dark ? "whitesmoke" : "#666"} size={40} />
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ margin: 5, textAlign: "center" }}>
                                                Are you sure?
                                            </div>
                                            <div style={{ padding: 10 }}>
                                                <Button
                                                    variant="outline-secondary"
                                                    style={{ borderRadius: ".35rem", width: "calc(50% - 2.5px)", marginRight: 5 }}
                                                    className={PageBP.Styles.button(this.state.dark)}
                                                    onClick={() => { this.setState({ showDeleteModal: false }); }}
                                                >
                                                    Keep
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    style={{ borderRadius: ".35rem", width: "calc(50% - 2.5px)" }}
                                                    className={PageBP.Styles.button(this.state.dark)}
                                                    onClick={() => { this.setState({ deleting: true }); this.deleteGuide(); }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </>
                                    )
                                }
                            </Modal.Body>
                        </Modal>
                        <EditModal
                            header="Header"
                            showEditModal={this.state.showHeaderEditModal}
                            closeEditModal={this.closeHeaderEditModal}
                            discardEditModal={this.discardHeaderEditModal}
                            dark={this.state.dark}
                        >
                            <Container
                                className={cx(this.state.dark && css`
                                    color: whitesmoke;
                                `)}
                            >
                                <Row>
                                    <Col>
                                        <h4>Preview</h4>
                                        <div
                                            style={{
                                                background: (this.state.dark ? "#161616" : "white"),
                                                color: (this.state.dark ? "whitesmoke" : "black"),
                                                border: (this.state.dark ? "1px solid #343434" : "1px solid #dcdcdc"),
                                                borderRadius: ".35rem", padding: 40,
                                            }}
                                        >
                                            <h2 style={{ fontFamily: "Jost, sans-serif", fontWeight: "bold", color: this.state.dark ? "whitesmoke" : "#333" }}>
                                                {this.state.headerEditModalValues.header}
                                            </h2>
                                            <h6 style={{ color: "#666", fontFamily: "Jost" }}>
                                                {(new Date()).toDateString()}
                                            </h6>
                                            <br />
                                            <p style={{ margin: 0, wordBreak: "break-word" }}>
                                                {this.state.headerEditModalValues.description}
                                            </p>
                                        </div>
                                    </Col>
                                </Row>
                                <hr
                                    style={{ marginTop: 30, marginBottom: 30 }}
                                    color={this.state.dark ? "#343434" : "#dcdcdc"}
                                />
                                <Row>
                                    <Col>
                                        <Form.Group onChange={this.updateHeaderEditValues}>
                                            <Form.Label style={{ fontSize: 22 }}>Title</Form.Label>
                                            <Form.Control
                                                size="lg"
                                                placeholder="Give your Guide a Title!"
                                                defaultValue={this.state.headerEditModalValues.header}
                                                id="edit-title"
                                                className={cx(this.state.dark && css`
                                                    &, &:active, &:focus, &:hover {
                                                        background: #161616;
                                                        border-color: #343434;
                                                        color: whitesmoke;
                                                    }
                                                `)}
                                            />
                                        </Form.Group>
                                        <div style={{ height: 15 }} />
                                        <Form.Group onChange={this.updateHeaderEditValues}>
                                            <Form.Label style={{ fontSize: 22 }}>Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                style={{ resize: "none", height: 150, padding: "10px 14px" }}
                                                placeholder="Give your Guide a Description!"
                                                defaultValue={this.state.headerEditModalValues.description}
                                                id="edit-desc"
                                                className={cx(this.state.dark && css`
                                                    &, &:active, &:focus, &:hover {
                                                        background: #161616;
                                                        border-color: #343434;
                                                        color: whitesmoke;
                                                    }
                                                `)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Container>
                        </EditModal>
                        {/*<Modal 
                            show={this.state.showHeaderEditModal} 
                            centered
                            style={{ fontFamily: "Jost" }}
                            className={cx(css`
                                .modal-content{
                                    border: 5px solid #dcdcdc;
                                    borderRadius: 0.35rem;
                                }
                            `)}
                            size="lg"
                        >
                            <Modal.Header style={{ padding: 25 }}>
                                <Modal.Title style={{ fontSize: "1.9rem", lineHeight: "60px", color: "grey" }}>
                                    &nbsp;&nbsp;&nbsp;<span style={{ fontWeight: "bold", color: "black" }}>Edit |</span> Header
                                </Modal.Title>
                                <Modal.Title style={{ float: "right" }}>
                                    <Button variant="outline-danger" style={{ width: 55, height: 55, borderWidth: 3 }} onClick={this.discardHeaderEditModal}>
                                        <Cross size={30} style={{ position: "relative", right: 2 }}/>
                                    </Button>
                                    &nbsp;&nbsp;
                                    <Button variant="outline-success" style={{ width: 55, height: 55, borderWidth: 3 }} onClick={this.closeHeaderEditModal}>
                                        <Check size={30} style={{ position: "relative", right: 2, top: 1 }}/>
                                    </Button>
                                    &nbsp;&nbsp;&nbsp;
                                </Modal.Title>
                            </Modal.Header>
                            
                            <Modal.Body style={{ padding: 30, background: "#f6f7f8" }}>
                                <Container>
                                    
                                </Container>
                            </Modal.Body>
                            </Modal>*/}
                    </Col>
                </Row>
            </Template >
        )
    }
}