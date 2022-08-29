import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { css, cx } from "@emotion/css";
import CStyles from "../../common/common_styles";
import Template from "../../common/template";
import { Row, Col, Button, OverlayTrigger, Tooltip, Modal, ListGroup, ListGroupItem } from "react-bootstrap";
import LocationCard from "../../common/location_card";
import { Book, Bookmark, BookOpen, Edit3, Hash, Heart, Link as LinkIcon, Maximize2, Minimize2, MoreHorizontal, X as Cross } from "react-feather";
import Skeleton from "react-loading-skeleton";
import ProfileCard from "../../common/profile_card/profile_card";
import UserHandler from "../../common/UserHandler";
import Avatar from "boring-avatars";
import { BounceLoader, PulseLoader } from "react-spinners";
import BlockRenderer from "./BlockRenderer";
import config from "../../../config";
import PageBP, { BPState } from "../../common/PageBP/PageBP";
import CommonType from "../../common/types";
import DropdownOnClick, { MenuBtn } from "../../common/dropdown";

import $ from "jquery";
import { Footnote } from "../../common/footnote";


const Styles = {
    positional_s: (pos?: string) => cx(css`
        border: 3px solid;
        width: 100%:
        border-right-width: 3px;
        border-left-width: 3px;
        &, .list-group-item {
            font-family: Jost;
        }
    `, pos === "bottom" && css`
        border-radius: 0px 0px .55rem .55rem;
        border-top: 0px;
    `, !pos && css`
        border-radius: .55rem;
    `),
    light_s: css`
        &, .list-group-item {
            background: white;
            border-color: #dcdcdc;
        }
    `,
    dark_s: css`
        &, .list-group-item {
            background: black;
            border-color: #343434;
            color: #DDD;
        }
        .top-guide-link > .list-group-item:hover {
            background: #333;
        }
    `
};

interface MatchParams {
    id: string;
}

type ProfileData = {
    username: string,
    description: string,
    location: string,
    bookmarks: string[],
    likes: string[]
};

enum ActiveState {
    ON,
    PENDING,
    OFF
};

type State = BPState & {
    guide: CommonType.Guide | null,
    contents?: CommonType.Block[],
    id: string,
    showBlocks: ({
        type: string,
        data: any,
        id: string
    })[] | null,
    redirectToHome: boolean,
    hasLoaded: boolean,
    zen: boolean,
    profile: ProfileData | null,
    bookmarking: boolean,
    liking: boolean,
    copied: boolean,
    showAddToListModal: boolean,
    lists: ({
        l: CommonType.List,
        activeState: ActiveState
    })[] | null,
    authorGuides: CommonType.Guide[] | null
};
interface Props extends RouteComponentProps<MatchParams> { };

export default class Guide extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            id: this.props.match.params.id,
            dark: this.localStorage!.getItem("darkmode") === "true",
            guide: null,
            showBlocks: null,
            user: (new UserHandler()).getUser(),
            redirectToHome: false,
            hasLoaded: false,
            zen: this.localStorage!.getItem('zen') === 'true',
            profile: null,
            bookmarking: false,
            liking: false,
            copied: false,
            showAddToListModal: false,
            lists: null,
            authorGuides: null
        };

        this.init();

        this.bookmarkGuide = this.bookmarkGuide.bind(this);
        this.likeGuide = this.likeGuide.bind(this);
        this.copyGuideLink = this.copyGuideLink.bind(this);
    }

    componentDidMount = () => window.scrollTo(0, 0);

    init() {
        fetch(config.endpoints.getGuide(this.state.id)).then(res => {
            if (res.status !== 200) {
                this.setState({ redirectToHome: true });
                return Promise.reject(res);
            }
            return res.json();
        })
            .then(guide => {
                if (!guide.id) this.setState({ redirectToHome: true });
                else {
                    const contents = guide.blocks.filter((x: any) => x.type === "section");
                    this.setState({
                        hasLoaded: true, guide: guide,
                        contents: contents.length > 0 ? contents : undefined,
                        showBlocks: this.toShowBlocks(guide.blocks)
                    });
                    // Fetch full profile for "More from __" widget
                    this.getFullProfile(guide.user);
                }
            });

        // Fetch lists belonging to the logged-in user
        if (this.state.user) {
            this.getLists(this.state.user.getUsername());
            fetch(config.endpoints.getProfile, {
                method: "POST",
                body: JSON.stringify({ username: this.state.user.getUsername() })
            }).then(res => res.json())
                .then(data => {
                    data = data.body;
                    this.setState({ profile: data.user });
                })
        }
    }

    getFullProfile = (username: string) => {
        fetch(config.endpoints.getProfile, {
            method: "POST",
            body: JSON.stringify({ username: username })
        }).then(res => res.json())
            .then(data => {
                data = data.body;
                const authorGuides = data.guides.filter((x: CommonType.Guide) => !x.isPrivate);
                this.setState({ authorGuides: authorGuides });
            });
    }

    getLists = (username: string) => {
        fetch(config.endpoints.getLists, {
            method: "POST",
            body: JSON.stringify({ username: username })
        })
            .then(res => res.json())
            .then(data => {
                this.setState({
                    lists: data.collections.map(
                        (x: CommonType.List) =>
                            ({ l: x, activeState: x.guides.includes(this.props.match.params.id) ? ActiveState.ON : ActiveState.OFF })
                    )
                });
            });
    }

    toShowBlocks = (blocks: ({ id: string, type: string, data: any })[]) => {
        let showBlocks = [];
        let accum = [];
        for (let i = 0; i < blocks.length; i++) {
            const current = blocks[i];
            const next = blocks[i + 1];
            if (current.type === "text") {
                accum.push(current);
                if (next === undefined || !(next.type === "text" && next.data.type === current.data.type)) {
                    showBlocks.push({
                        type: "textseq",
                        data: {
                            text: accum.map(x => x.data.text),
                            type: accum[0].data.type
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
                        data: accum.map(x => x.data.code),
                        id: accum[0].id
                    });
                    accum = [];
                };
            } else showBlocks.push(current);
        }
        return showBlocks;
    }

    async bookmarkGuide() {
        if (this.state.profile == null || this.state.guide == null) return;
        const profile = this.state.profile;
        this.setState({ bookmarking: true });

        const index = profile.bookmarks.indexOf(this.state.guide.id);
        if (index !== -1) profile.bookmarks.splice(index, 1);
        else profile.bookmarks.push(this.state.guide.id);

        await fetch(config.endpoints.updateUserProfile, {
            method: "POST",
            body: JSON.stringify(profile)
        })
            .then(res => res.json())
            .then(data => {
                this.setState({ profile: profile, bookmarking: false });
                this.localStorage!.setItem("profile", JSON.stringify(data));
            });
    }

    likeGuide = async () => {
        if (this.state.profile == null || this.state.guide == null) return;
        const profile = this.state.profile;
        this.setState({ liking: true });

        let liked = true;

        const guide = this.state.guide;
        const index = profile.likes.indexOf(guide.id);
        if (index !== -1) {
            profile.likes.splice(index, 1);
            liked = false;
            guide.likes! -= 1;
        } else {
            profile.likes.push(this.state.guide.id);
            guide.likes! += 1;
        }

        // Update user profile
        await fetch(config.endpoints.updateUserProfile, {
            method: "POST",
            body: JSON.stringify(profile)
        })
            .then(res => res.json())
            .then(data => {
                this.setState({ profile: profile, liking: false, guide: guide });
                this.localStorage!.setItem("profile", JSON.stringify(data));
            });

        // Like Guide
        await fetch(config.endpoints.likeGuide, {
            method: "POST",
            body: JSON.stringify({
                id: this.state.guide.id,
                like: liked
            })
        });

    }

    async copyGuideLink() {
        navigator.clipboard.writeText(window.location.href);

        this.setState({ copied: true }, () => {
            setTimeout(() => { this.setState({ copied: false }) }, 1500);
        });
    }

    toggleListInclude = async (id: string) => {
        // Get index
        const lists = this.state.lists;
        if (!lists) return;
        const index = lists?.findIndex(x => x.l.id === id);
        if (index === -1) return;

        // Update state
        const targetList = lists[index];
        const newState = targetList.activeState === ActiveState.ON ? ActiveState.OFF : ActiveState.ON;
        targetList.activeState = ActiveState.PENDING;
        lists[index] = targetList;
        await this.setState({ lists: lists });

        // Add/Remove guide from list
        const existingIndex = targetList.l.guides.indexOf(this.state.id);
        if (existingIndex === -1) targetList.l.guides.push(this.state.id);
        else targetList.l.guides.splice(existingIndex, 1);

        targetList.activeState = newState;
        lists[index] = targetList;
        fetch(config.endpoints.updateList, {
            method: "POST",
            body: JSON.stringify(targetList.l)
        }).then(res => res.json())
            .then(data => this.setState({ lists: lists }));
    }

    render() {
        let contentsHeightSub = 0;
        if (this.state.authorGuides && this.state.authorGuides.length > 0) {
            contentsHeightSub = contentsHeightSub + Math.min(400, 230 + this.state.authorGuides.length * 70);
        } else contentsHeightSub += 150;
        if (this.state.user) contentsHeightSub += 70;

        if (this.state.guide == null && this.state.redirectToHome) return (
            <Template dark={this.state.dark} user={this.state.user} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                <Row>
                    <Col md={3} />
                    <Col md={6}>
                        <LocationCard dark={this.state.dark}>
                            <BookOpen size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Guide</strong>
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
        );// return (<Redirect to="/" />);

        const widthBtnStyle = css`
            padding: 5px;
            border-radius: .35rem;
            position: relative;
            bottom: 2px;
            &:hover { 
                background: ${this.state.dark ? "#343434" : "whitesmoke"};
                cursor: pointer;
            }
        `;
        return (
            <Template user={this.state.user} dark={this.state.dark} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                {/**<WelcomeCard/>*/}
                <Modal
                    size="sm"
                    show={this.state.showAddToListModal}
                    onShow={() => $("#more-btn").trigger("click")}
                    onHide={() => this.setState({ showAddToListModal: false })}
                    className={cx(css`
                        .modal-content {
                            border-radius: .45rem;
                            border-width: 0px;
                        }
                    `)}
                    centered
                >
                    <Modal.Body
                        style={{
                            fontFamily: "Jost",
                            padding: "30px 30px 20px 30px",
                            background: (this.state.dark ? "#161616" : undefined),
                            color: (this.state.dark ? "whitesmoke" : "#333"),
                            border: "1px solid",
                            borderRadius: ".35rem",
                            borderColor: (this.state.dark ? "#343434" : "#dcdcdc")
                        }}
                    >
                        <h5 style={{ fontWeight: "bold" }}>
                            Choose a List
                            <Cross
                                style={{ float: "right" }}
                                className={cx(css`
                                    opacity: .5;
                                    &:hover {
                                        cursor: pointer;
                                        opacity: .9 !important;
                                    }
                                `)}
                                onClick={() => this.setState({ showAddToListModal: false })}
                            />
                        </h5>
                        <br />
                        {
                            this.state.lists ? this.state.lists.map(x => (
                                <Button
                                    style={{ border: 0, width: "100%", marginBottom: 10 }}
                                    className={cx(this.state.dark ? css`
                                        background: #343434 !important;
                                        color: whitesmoke;
                                        &:hover, &:active, &:focus {
                                            background: #666 !important;
                                        }
                                    ` : css`
                                        background: whitesmoke !important;
                                        &, &:hover, &:active, &:focus {
                                            color: #333 !important;
                                        }
                                        &:hover, &:active, &:focus {
                                            background: #DDD !important;
                                        }
                                    `, x.activeState === ActiveState.ON && css`
                                        border: 3px solid var(--success) !important;
                                        padding: calc(.375rem - 3px) calc(.75rem - 3px);
                                    `, x.activeState === ActiveState.PENDING && css`
                                        border: 3px solid var(--primary) !important;
                                        padding: calc(.375rem - 3px) calc(.75rem - 3px);
                                        opacity: .5;
                                    `)}
                                    onClick={() => this.toggleListInclude(x.l.id)}
                                    disabled={x.activeState === ActiveState.PENDING}
                                >
                                    {x.l.header}
                                    <span
                                        style={{ zIndex: 3, position: "absolute", right: "calc(50% - 20px)" }}
                                        hidden={x.activeState !== ActiveState.PENDING}
                                    >
                                        <PulseLoader color="var(--primary)" size={10} />
                                    </span>
                                </Button>
                            )) : <BounceLoader size={40} />
                        }
                        {
                            this.state.lists && this.state.lists.length === 0 && (
                                <div
                                    className={cx("text-center list-group-item-primary",
                                        (this.state.dark && css`
                                        background: #343434;
                                        color: whitesmoke;
                                    `)
                                    )}
                                    style={{ borderRadius: ".35rem", padding: 20, fontFamily: "Jost" }}
                                >
                                    You have no lists! Create one at  <Link
                                        to="/lists"
                                        style={{
                                            textDecoration: "underline",
                                            color: this.state.dark ? "whitesmoke" : "black"
                                        }}
                                    >My Lists</Link>.
                                </div>
                            )
                        }
                    </Modal.Body>
                </Modal>
                <Row>
                    {
                        this.state.zen && (
                            <Col md={2} sm={0} />
                        )
                    }
                    <Col md={8} sm={12}>
                        <LocationCard dark={this.state.dark}>
                            <BookOpen size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Guide</strong>
                            <span style={{ float: "right" }}>
                                {
                                    this.state.zen ? (
                                        <Maximize2
                                            size={26}
                                            className={cx(widthBtnStyle)}
                                            onClick={() => { this.setState({ zen: false }); this.localStorage!.setItem("zen", "false"); }}
                                        />
                                    ) : (
                                        <Minimize2
                                            size={26}
                                            className={cx(widthBtnStyle)}
                                            onClick={() => { this.setState({ zen: true }); this.localStorage!.setItem("zen", "true"); }}
                                        />
                                    )
                                }
                            </span>
                        </LocationCard>
                        <br />
                        {
                            (this.state.guide != null) ? (<>
                                <div
                                    style={{
                                        background: (this.state.dark ? "#161616" : "white"),
                                        color: (this.state.dark ? "whitesmoke" : "black"),
                                        border: "3px solid",
                                        borderColor: (this.state.dark ? "#343434" : "#dcdcdc"),
                                        borderRadius: ".55rem"
                                    }}
                                >
                                    <div style={{ padding: 30, paddingBottom: 10 }}>
                                        <h3 style={{ fontFamily: "Jost, sans-serif", fontWeight: "bold", color: this.state.dark ? "whitesmoke" : "#333" }}>
                                            {this.state.guide.header}
                                        </h3>
                                        <h6 style={{ color: "#666", fontFamily: "Jost" }}>
                                            {(new Date(this.state.guide.timestamp)).toDateString()}
                                        </h6>
                                        {
                                            this.state.guide.description && (
                                                <>
                                                    <p style={{ wordBreak: "break-word", overflow: "hidden", fontFamily: "Jost" }}>
                                                        {this.state.guide.description}
                                                    </p>
                                                </>
                                            )
                                        }
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "Jost", padding: "10px 15px", borderTop: "1px solid",
                                            borderColor: this.state.dark ? "#343434" : "#dcdcdc",
                                            display: "flex", justifyContent: "space-between"
                                        }}
                                    >
                                        <Link to={`/user/${this.state.guide.user}`} className={cx(CStyles.flat_link)}>
                                            <span
                                                style={{
                                                    padding: "6px 15px", fontSize: "14pt",
                                                    fontWeight: "bold", position: "relative",
                                                    top: 3, color: this.state.dark ? "whitesmoke" : "#444"
                                                }}
                                                className={cx(this.state.dark ? css`
                                                    transition: all .25s;
                                                    border-radius: .35rem; 
                                                    color: white;
                                                    &:hover {
                                                        background: #343434;
                                                        cursor: pointer;
                                                    }
                                                ` : css`
                                                    transition: all .25s;
                                                    border-radius: .35rem; 
                                                    &:hover {
                                                        background: #ededed;
                                                        cursor: pointer;
                                                    }
                                                `)}
                                            >
                                                <span style={{ position: "relative", bottom: 2 }}>
                                                    <Avatar
                                                        size={22}
                                                        name={this.state.guide.user}
                                                        variant="marble"
                                                        colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                                    />
                                                    &nbsp;&nbsp;
                                                </span>
                                                {this.state.guide.user}
                                            </span>
                                        </Link>
                                        <span>
                                            {
                                                (this.state.user?.getUsername() === this.state.guide.user) && (
                                                    <Link to={`/e/${this.state.guide.id}`}>
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
                                                        >
                                                            <Edit3 size={17} style={{ position: "relative", bottom: 3 }} />
                                                            &nbsp;&nbsp;
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                )
                                            }
                                            &nbsp;
                                            {
                                                this.state.user && (
                                                    <DropdownOnClick
                                                        popoverId="guide-more-dropdown"
                                                        placement="bottom"
                                                        dark={this.state.dark}
                                                        overlay={
                                                            <>
                                                                <MenuBtn
                                                                    onClick={() => this.setState({ showAddToListModal: true })}
                                                                    dark={this.state.dark}
                                                                >
                                                                    <Book size={17} style={{ position: "relative", bottom: 2 }} color="#666" />&nbsp;
                                                                    Add to List
                                                                </MenuBtn>
                                                            </>
                                                        }
                                                    >
                                                        <Button size="sm"
                                                            id="more-btn"
                                                            style={{ border: "3px solid", padding: "5px 9px", paddingBottom: 4 }}
                                                            className={PageBP.Styles.button(this.state.dark, true)}
                                                        >
                                                            <MoreHorizontal size={20} style={{ position: "relative", bottom: 2 }} />
                                                        </Button>
                                                    </DropdownOnClick>
                                                )
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div style={{ height: 15 }} />
                                {this.state.showBlocks && BlockRenderer.render(this.state.showBlocks, this.state.dark, this.state.zen)}
                            </>) : (
                                <div className={cx(css`
                                    border: 3px solid ${this.state.dark ? "#343434" : "#dcdcdc"};
                                    background: ${this.state.dark ? "#161616" : "white"};
                                    width: 100%;
                                    border-radius: .55rem;
                                `, this.state.dark && css`
                                    .react-loading-skeleton {
                                        background-color: #333;
                                    }
                                `)}>
                                    <div style={{ padding: "30px 30px 10px 30px" }}>
                                        <h2><Skeleton width={380} /></h2>
                                        <h6 style={{ marginBottom: 10 }}><Skeleton width={120} /></h6>
                                        <p><Skeleton count={2} /></p>
                                    </div>
                                    <div style={{ padding: "10px 25px 8px 25px", borderTop: "1px solid", borderColor: this.state.dark ? "#343434" : "#dcdcdc" }}>
                                        <span style={{ padding: 3, fontSize: "15pt", fontWeight: "bold" }}>
                                            <span style={{ position: "relative", bottom: 2 }}>
                                                <Skeleton style={{ width: 24, height: 24, borderRadius: "50%" }} />
                                                &nbsp;&nbsp;
                                            </span>
                                            <Skeleton width={100} />
                                            &nbsp;&nbsp;
                                        </span>
                                    </div>
                                </div>
                            )
                        }
                        <br />
                        <div style={{ textAlign: "center" }}>
                            { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a href="#" className={(CStyles.flat_link, "top")}>
                                <Button
                                    /*variant="outline-secondary"
                                    style={{
                                        borderWidth: 3,
                                        borderRadius: ".35rem",
                                        fontFamily: "Jost",
                                        transition: "all 0s",
                                        fontWeight: "bold"
                                    }}
                                    className={cx(css`
                                        background: ${this.state.dark ? "#161616" : "white"};
                                `   )}*/
                                    style={{
                                        fontFamily: "Jost"
                                    }}
                                    className={PageBP.Styles.button(this.state.dark)}
                                >
                                    &nbsp;
                                    Back to Top
                                    &nbsp;
                                </Button>
                            </a>
                        </div>
                        <br />
                    </Col>
                    {
                        this.state.zen && (<Col md={2} sm={0} />)
                    }
                    <Col md={4} sm={0} className={cx(CStyles.small_col_s)} hidden={this.state.zen}>
                        <ProfileCard
                            user={this.state.user}
                            hasLoaded={this.state.hasLoaded}
                            dark={this.state.dark}
                            localStorage={this.localStorage!}
                        />
                        <div
                            style={{
                                position: "sticky",
                                top: 25,
                            }}
                            className={cx(css`
                                .btn:not(:hover) {
                                    border-color: ${this.state.dark ? "#343434" : "#dcdcdc"};
                                }
                            `)}
                        >
                            {
                                (this.state.profile && this.state.profile.bookmarks && this.state.guide) && (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontFamily: "Jost",
                                            margin: "15px 5px 0px 5px",
                                            flexWrap: "wrap"
                                        }}
                                    >
                                        <OverlayTrigger
                                            placement="bottom"
                                            overlay={
                                                <Tooltip id="panel-like-tooltip">
                                                    {
                                                        this.state.profile.likes.includes(this.state.guide.id) ? "Unlike" : "Like"
                                                    }
                                                </Tooltip>
                                            }
                                        >
                                            <Button variant="light" size="sm"
                                                style={{
                                                    borderRadius: ".35rem 0px 0px .35rem", border: "3px solid",
                                                    paddingBottom: 2, flexGrow: 1, flex: 2,
                                                    fontWeight: "bold", color: "whitesmoke",
                                                    minWidth: "fit-content",
                                                    borderColor: "#e11d48", background: "#e11d48" // this.state.dark ? "#343434" : "#dcdcdc"
                                                }}
                                                className={cx(css`
                                                    background: ${this.state.dark ? "#161616" : "white"};
                                                `, css`
                                                    &:hover {
                                                        background: #f43f5e !important;
                                                        border-color: #f43f5e !important;
                                                    }
                                                `)}
                                                onClick={this.likeGuide}
                                            >
                                                {
                                                    this.state.liking ? (
                                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                                            <BounceLoader size={25} color="white" />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Heart
                                                                size={17}
                                                                style={{
                                                                    position: "relative", bottom: 2,
                                                                    fill: this.state.profile.likes.includes(this.state.guide.id) ? "white" : "var(--danger)"
                                                                }}
                                                            />
                                                            &nbsp;&nbsp;
                                                            {this.state.guide?.likes}
                                                        </>
                                                    )
                                                }
                                            </Button>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            placement="bottom"
                                            overlay={
                                                <Tooltip id="panel-bookmark-tooltip">
                                                    {
                                                        this.state.profile.bookmarks.includes(this.state.guide.id) ? "Remove Bookmark" : "Bookmark"
                                                    }
                                                </Tooltip>
                                            }
                                        >
                                            <Button variant="light" size="sm"
                                                style={{
                                                    borderRadius: 0, border: "3px solid",
                                                    paddingBottom: 2, flexGrow: 1, flex: 3,
                                                    fontWeight: "bold", color: "whitesmoke",
                                                    minWidth: "fit-content", padding: 5,
                                                    borderColor: "#2563eb", background: "#2563eb" // this.state.dark ? "#343434" : "#dcdcdc"
                                                }}
                                                className={cx(css`
                                                    background: ${this.state.dark ? "#161616" : "white"};
                                                `, css`
                                                    &:hover {
                                                        background: #3b82f6 !important;
                                                        border-color: #3b82f6 !important;
                                                    }
                                                `)}
                                                onClick={this.bookmarkGuide}
                                            >
                                                {
                                                    this.state.bookmarking ? (
                                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                                            <BounceLoader size={21} color="white" />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Bookmark
                                                                size={17}
                                                                style={{
                                                                    position: "relative", bottom: 2,
                                                                    fill: this.state.profile.bookmarks.includes(this.state.guide.id) ? "white" : "transparent"
                                                                }}
                                                            />
                                                            &nbsp;
                                                            Bookmark
                                                        </>
                                                    )
                                                }
                                            </Button>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            placement="bottom"
                                            overlay={this.state.copied ? (
                                                <Tooltip id="panel-link-tooltip">
                                                    <span style={{ fontWeight: "bold" }}>Copied!</span>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip id="panel-link-tooltip">
                                                    Copy Share Link
                                                </Tooltip>
                                            )
                                            }
                                        >
                                            <Button size="sm"
                                                // id="more-btn"
                                                style={{
                                                    border: "3px solid",
                                                    padding: "5px 9px",
                                                    paddingBottom: 4,
                                                    flexGrow: 1, flex: 2,
                                                    minWidth: "fit-content",
                                                    borderRadius: "0px .35rem .35rem 0px",
                                                    borderLeft: "none"
                                                }}
                                                className={PageBP.Styles.button(this.state.dark, true)}
                                                onClick={this.copyGuideLink}
                                            >
                                                <LinkIcon size={17} style={{ position: "relative", bottom: 2 }} />
                                                &nbsp;
                                                Link
                                            </Button>
                                        </OverlayTrigger>
                                    </div>
                                )
                            }
                            {
                                this.state.contents && (
                                    <>
                                        <div
                                            style={{
                                                width: "100%",
                                                border: "3px solid",
                                                borderRadius: this.state.guide &&
                                                    this.state.authorGuides &&
                                                    this.state.authorGuides?.length > 0 ? ".55rem .55rem 0 0" : ".55rem",
                                                background: this.state.dark ? "#161616" : "whitesmoke",
                                                borderColor: this.state.dark ? "#343434" : "#dcdcdc",
                                                fontFamily: "Jost",
                                                // padding: 20,
                                                // padding: "18px 20px"
                                                marginTop: 15
                                            }}
                                        >
                                            <div style={{ padding: "18px 20px" }}>
                                                <h5 style={{ fontWeight: "bold", color: this.state.dark ? "whitesmoke" : "#333", marginBottom: 0 }}>
                                                    Contents
                                                </h5>
                                            </div>
                                            <div
                                                style={{
                                                    padding: 10, borderTop: "2px solid",
                                                    borderColor: this.state.dark ? "#343434" : "#dcdcdc",
                                                    background: this.state.dark ? "black" : "white",
                                                    maxHeight: `calc(100vh - ${contentsHeightSub}px)`,
                                                    // height: `calc(100vh - ${this.state.user ? 125 : 50}px)`,
                                                    overflowY: "auto",
                                                    borderRadius: "0 0 .55rem .55rem"
                                                }}
                                            >
                                                {
                                                    this.state.contents.map(x => (
                                                        <a href={`#sec-${x.id}`} className={cx(CStyles.flat_link, css`
                                                        &:hover {
                                                            background: ${this.state.dark ? "#343434" : "whitesmoke"};
                                                            border-radius: .35rem;
                                                        }
                                                    `)} style={{ display: "block", padding: "5px 10px", color: this.state.dark ? "whitesmoke" : "#333" }}>
                                                            <Hash size={14} color="grey" style={{ position: "relative", marginBottom: 3 }} />
                                                            &nbsp;&nbsp;
                                                            {(x.data as { header: string }).header}
                                                        </a>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        {/* <hr style={{ borderWidth: 3, marginTop: 0 }} color={this.state.dark ? "#343434" : "#dcdcdc" }/> */}
                                    </>)
                            }
                            {
                                this.state.guide && this.state.authorGuides ? (
                                    this.state.authorGuides.length > 0 && (
                                        <ListGroup
                                            className={cx(
                                                Styles.positional_s(this.state.contents ? "bottom" : undefined),
                                                (this.state.dark ? Styles.dark_s : Styles.light_s)
                                            )}
                                            style={{ marginTop: this.state.contents ? 0 : 15 }}
                                        >
                                            <ListGroupItem
                                                style={{
                                                    padding: "18px 20px", fontSize: "1.25rem",
                                                    fontWeight: "bold", borderTop: 0,
                                                    borderRadius: ".4rem .4rem 0px 0px",
                                                    borderWidth: 0, borderBottomWidth: 2.4,
                                                    background: this.state.dark ? "#161616" : "whitesmoke"
                                                }}
                                                className={cx(css`
                                                    ${!this.state.dark && "background: whitesmoke !important;"}
                                                `)}
                                            >
                                                More from {this.state.guide?.user}
                                            </ListGroupItem>
                                            <div
                                                style={{
                                                    maxHeight: `calc(${contentsHeightSub}px - 40px)`,
                                                    overflow: "auto"
                                                }}>
                                                {
                                                    this.state.authorGuides && this.state.authorGuides.map((g, i) => (
                                                        <Link to={`/gr/${g.id}`} className={cx(CStyles.flat_link, "top-guide-link")}>
                                                            <ListGroupItem className={cx(css`
                                                                ${i === this.state.authorGuides!.length - 1 ? "border-radius: 0px 0px .4rem .4rem !important;border-bottom: 0px;" : "border-radius: 0px !important;"}
                                                                border-left-width: 0px;
                                                                border-right-width: 0px;
                                                                &:hover {
                                                                    cursor: pointer;
                                                                    background: whitesmoke;
                                                                }
                                                            `)}>
                                                                <h6>{g.header}</h6>
                                                                <h6 style={{ color: "gray", margin: 0 }}>{(new Date(g.timestamp)).toDateString()}</h6>
                                                            </ListGroupItem>
                                                        </Link>
                                                    ))
                                                }
                                            </div>
                                        </ListGroup>
                                    )
                                ) : (
                                    <ListGroup
                                        className={cx(
                                            Styles.positional_s(this.state.contents ? "bottom" : undefined),
                                            (this.state.dark ? Styles.dark_s : Styles.light_s)
                                        )}
                                        style={{ marginTop: this.state.contents ? 0 : 15 }}
                                    >
                                        <ListGroupItem
                                            style={{
                                                padding: "38px 20px",
                                                fontSize: "1.25rem",
                                                fontWeight: "bold",
                                                border: 0,
                                                borderRadius: ".4rem",
                                                background: this.state.dark ? "#161616" : "white"
                                            }}
                                            className={cx(css`
                                                ${!this.state.dark && "background: white !important;"}
                                            `)}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <BounceLoader size={50} color={this.state.dark ? "whitesmoke" : "#666"} />
                                            </div>
                                        </ListGroupItem>
                                    </ListGroup>
                                )
                            }
                            <Footnote dark={this.state.dark} />
                            <br />
                        </div>
                        {/*<TopGuidesWidget/>*/}
                    </Col>
                </Row>
            </Template >
        )
    }
}