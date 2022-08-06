import { CognitoUser } from "amazon-cognito-identity-js";
import { css, cx } from "@emotion/css";
import * as React from "react";
import { Button, Col, Container, Form, ListGroup, Modal, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { Edit3, Eye, EyeOff, Folder, FolderPlus, Heart, Plus, Trash2, Link as LinkIcon, ArrowLeft } from "react-feather";
import { Redirect } from "react-router-dom";
import LocationCard from "../../common/location_card";
import Template from "../../common/template";
import UserHandler from "../../common/UserHandler";
import config from "../../../config";
import { BounceLoader, PulseLoader } from "react-spinners";
import typesense from "typesense";

import $ from "jquery";
import GuideToggle, { ToggleState } from "./GuideToggle";
import CommonType from "../../common/types";
import TimelineCard from "../../common/timeline_card/timeline_card";
import TimelineCardSkeleton from "../../common/timeline_card/timeline_card_skeleton";
import EditModal from "../editor/Blocks/EditModal";
import PageBP from "../../common/PageBP/PageBP";
import { Footnote } from "../../common/footnote";

type Props = {};
type State = {
    user: CognitoUser | null,
    collections: CommonType.List[]
    dark: boolean,
    activeList: {
        list: CommonType.List,
        guides: CommonType.Guide[] | null
    } | null,
    hasLoaded: boolean,
    lastSearch: string | undefined,
    searchResults: ({
        g: CommonType.Guide,
        active: ToggleState
    })[],
    actionState: {
        isSearching: boolean,
        showGuideSearch: boolean,
        showEditModal: boolean,
        isCreatingGuide?: boolean,
        togglingVisibility?: boolean
    },
    deleting?: boolean,
    showDeleteModal?: boolean,
    likesIsActive: boolean,
    likedGuides: CommonType.Guide[] | null,
    copied: boolean,
    loading: boolean
};

const Styles = {
    nav_icon: css`
        border: 1px solid;
        justify-content: center;
        align-items: center;
        height: 40px;
        vertical-align: middle;
        margin-bottom: 5px;
        border-radius: 20px;
        padding: 10px 5px;
        &:hover {
            cursor: pointer; 
            text-decoration: none; 
            border-width: 3px;
            padding: 8px 3px;
        }
    `,
    nav_icon_light: css`
        border-color: #dcdcdc;
        display: inline-flex;
        color: black;
        &:hover { 
          background: whitesmoke; 
          color: black; 
        }
    `,
    nav_icon_dark: css`
        border-color: dimgray;
        display: inline-flex;
        color: #d7dadc;
        &:hover { 
            background: #333; 
            color: whitesmoke; 
        }
    `
};

export default class Lists extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: this.localStorage!.getItem("darkmode") === "true",
            user: (new UserHandler()).getUser(),
            collections: [],
            activeList: null,
            hasLoaded: false,
            searchResults: [],
            actionState: {
                isSearching: false,
                showGuideSearch: false,
                showEditModal: false
            },
            lastSearch: undefined,
            likesIsActive: false,
            likedGuides: null,
            copied: false,
            loading: false
        };

        this.init();
        // this.setLikesActive();

        this.searchForGuide = this.searchForGuide.bind(this);
        this.toggleActiveSearchResult = this.toggleActiveSearchResult.bind(this);
    }

    componentDidMount = () => { this.setLikesActive(); }

    refreshLists = () => {
        fetch(config.endpoints.getLists, {
            method: "POST",
            body: JSON.stringify({ username: this.state.user?.getUsername() })
        })
            .then(res => res.json())
            .then(data => this.setState({
                collections: data.collections.sort((x: CommonType.List, y: CommonType.List) =>
                    (new Date(x.timestamp)).getTime()
                    - (new Date(y.timestamp)).getTime()
                ),
                hasLoaded: true
            }));
    }

    togglePrivate = async () => {
        const actionState = this.state.actionState;
        actionState.togglingVisibility = true;
        await this.setState({ actionState: actionState });

        const activeList = this.state.activeList;
        if (!activeList) return;
        activeList.list.isPrivate = !activeList.list.isPrivate;

        await fetch(config.endpoints.updateList, {
            method: "POST",
            body: JSON.stringify(activeList.list)
        }).then(res => res.json())
            .then(_ => {
                const actionState = this.state.actionState;
                actionState.togglingVisibility = false;
                this.setState({
                    activeList: activeList,
                    actionState: actionState
                });
            });
    }

    init = () => this.refreshLists();

    createCollection = async () => {
        await this.setState({ hasLoaded: false });
        await fetch(config.endpoints.createList, {
            method: "POST",
            body: JSON.stringify({
                user: this.state.user?.getUsername(),
                header: "New List",
                description: "",
                timestamp: (new Date()).toISOString(),
                isPrivate: true
            })
        });
        this.refreshLists();
    }

    setActiveList = async (l: CommonType.List) => {
        await this.setState({
            activeList: { list: l, guides: null },
            likesIsActive: false
        });
        await fetch(config.endpoints.getList(l.id))
            .then(res => res.json())
            .then(data => {
                this.setState({
                    activeList: data,
                    searchResults: [],
                    actionState: {
                        isSearching: false,
                        showGuideSearch: false,
                        showEditModal: false
                    }
                });
            });
    }

    setLikesActive = async () => {
        await this.setState({
            likesIsActive: true,
            activeList: null,
            searchResults: [],
            actionState: {
                isSearching: false,
                showGuideSearch: false,
                showEditModal: false
            }
        });
        await fetch("https://hzhfyqxdsdr5srgkjhlajpxm7u0zwhfb.lambda-url.eu-west-1.on.aws/", {
            method: "POST",
            body: JSON.stringify({ username: this.state.user?.getUsername() })
        })
            .then(res => res.json())
            .then(data => this.setState({
                likedGuides: data.guides
            }));
    }

    async searchForGuide(e: React.FormEvent) {
        e.preventDefault();
        const search_term = $("#search-field").val() as string;
        if (!search_term) return;
        const actionState = this.state.actionState;
        actionState.isSearching = true;
        this.setState({ actionState: actionState, lastSearch: search_term });

        const client = new typesense.SearchClient(config.typesense_search_options);
        const res = await client.collections("guides").documents().search({
            "q": search_term,
            "query_by": "header"
        }, {});
        if (res.hits) {
            const actionState = this.state.actionState;
            actionState.isSearching = false;
            const activeList = this.state.activeList?.guides;
            this.setState({
                searchResults: res.hits.map(x => x.document as CommonType.Guide)
                    .map((x: CommonType.Guide) => ({
                        g: x,
                        active: (activeList && activeList.filter(y => y.id === x.id).length > 0)
                            ? ToggleState.ON : ToggleState.OFF
                    })),
                actionState: actionState
            });
        }
    }

    toggleGuideSearch = () => {
        let { searchResults, actionState, lastSearch } = this.state
        actionState.showGuideSearch = !actionState.showGuideSearch;

        if (!actionState.showGuideSearch) {
            searchResults = [];
            lastSearch = undefined;
        }

        this.setState({
            actionState: actionState,
            searchResults: searchResults,
            lastSearch: lastSearch
        });
    }

    async toggleActiveSearchResult(g: CommonType.Guide, ts: ToggleState) {
        const searchResults = this.state.searchResults;
        const index = searchResults.findIndex(x => x.g.id === g.id);
        if (index !== -1) {
            searchResults[index] = {
                active: ts,
                g: searchResults[index].g
            };

            let activeList = this.state.activeList;
            let stateUpdate = {
                searchResults: searchResults,
                activeList: activeList
            };

            if (ts !== ToggleState.LOADING && !!activeList?.guides) {
                if (ts === ToggleState.ON) activeList.guides?.push(g);
                else {
                    const index = activeList.guides.findIndex(x => x.id === g.id);
                    if (index !== -1) activeList.guides?.splice(index, 1);
                }
                stateUpdate.activeList = activeList;
            }

            await this.setState(stateUpdate);
        }
    }

    newGuideInActiveList = async () => {
        let { activeList, actionState } = this.state;
        actionState.isCreatingGuide = true;
        this.setState({ actionState: actionState });

        const options = {
            method: "POST",
            body: JSON.stringify({
                header: "New Guide",
                timestamp: (new Date()).toISOString(),
                blocks: [],
                user: this.state.user?.getUsername(),
                isPrivate: true
            })
        };

        const newGuideId = await fetch(config.endpoints.createGuide, options)
            .then(res => {
                if (res.status !== 200) return Promise.reject(res);
                return res.json();
            }).then(data => data.body);

        activeList?.list.guides.push(newGuideId);

        await fetch(config.endpoints.updateList, {
            method: "POST",
            body: JSON.stringify(activeList!.list)
        });

        const elem = document.getElementById("hidden_link");
        if (!elem) return;
        elem.setAttribute("href", `/e/${newGuideId}`);
        elem.click();
    }

    deleteActiveList = async () => {
        if (!this.state.activeList) return;
        await this.setState({ hasLoaded: false });
        await fetch(config.endpoints.deleteList(this.state.activeList.list.id), {
            method: "DELETE"
        });
        this.setState({
            activeList: null,
            showDeleteModal: false,
            deleting: false
        });
        this.refreshLists();
    }

    editActiveList = async () => {
        if (!this.state.activeList) return;

        this.setState({ loading: true });

        const newName = $("#list-edit-header").val() as string;
        const newDesc = $("#list-edit-desc").val() as string;

        const activeList = this.state.activeList;
        activeList.list.header = newName;
        activeList.list.description = newDesc;

        const lists = this.state.collections;
        const index = lists.findIndex(x => x.id === activeList.list.id);
        if (index !== -1) lists[index] = activeList.list;

        fetch("https://iv6csj22wy5kzbrrcmpljvkdqy0sthwb.lambda-url.eu-west-1.on.aws/", {
            method: "POST",
            body: JSON.stringify(activeList.list)
        })
            .then(res => res.json())
            .then(_ => {
                const actionState = this.state.actionState;
                actionState.showEditModal = false;
                this.setState({ actionState: actionState, collections: lists, loading: false });
            });
    }

    copyGuideLink = async () => {
        navigator.clipboard.writeText(`${window.location.origin}/list/${this.state.activeList?.list.id}`);

        this.setState({ copied: true }, () => {
            setTimeout(() => this.setState({ copied: false }), 1500);
        });
    }

    render() {
        if (this.state.user == null) return (<Redirect to="/auth/login" />)
        return (
            <Template dark={this.state.dark} user={this.state.user} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                { /*  */}
                { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ /*eslint-disable-next-line jsx-a11y/anchor-has-content */}
                <a id="hidden_link" href="#" hidden />
                <EditModal
                    dark={this.state.dark}
                    showEditModal={this.state.actionState.showEditModal}
                    closeEditModal={this.editActiveList}
                    discardEditModal={() => {
                        const actionState = this.state.actionState;
                        actionState.showEditModal = false;
                        this.setState({ actionState: actionState });
                    }}
                    header="List"
                    loading={this.state.loading}
                >
                    <Container>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label
                                        style={{
                                            fontSize: 22,
                                            color: this.state.dark ? "whitesmoke" : "#333"
                                        }}
                                    >Title</Form.Label>
                                    <Form.Control
                                        size="lg"
                                        id="list-edit-header"
                                        style={{
                                            width: "100%", padding: 30, fontFamily: "Jost",
                                            resize: "none", borderRadius: ".35rem", margin: 0,
                                            border: "1px solid",
                                            borderColor: this.state.dark ? "#444" : "#dcdcdc",
                                            background: this.state.dark ? "#1A1A1B" : "white",
                                            color: this.state.dark ? "whitesmoke" : "#333"
                                        }}

                                        className={cx(css`
                                            &:focus {
                                                outline: none;
                                            }
                                        `)}
                                        defaultValue={
                                            this.state.activeList ?
                                                this.state.activeList.list.header : undefined
                                        }
                                    />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label
                                        style={{
                                            fontSize: 22,
                                            color: this.state.dark ? "whitesmoke" : "#333"
                                        }}
                                    >Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        style={{
                                            resize: "none", height: 150, padding: "10px 14px",
                                            border: "1px solid",
                                            borderColor: this.state.dark ? "#444" : "#dcdcdc",
                                            background: this.state.dark ? "#1A1A1B" : "white",
                                            color: this.state.dark ? "whitesmoke" : "#333"
                                        }}
                                        placeholder="Give your List a Description!"
                                        defaultValue={
                                            this.state.activeList ?
                                                this.state.activeList.list.description : undefined
                                        }
                                        id="list-edit-desc"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Container>
                </EditModal>
                <Row>
                    <Col>
                        <LocationCard dark={this.state.dark}>
                            <Folder size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Lists</strong>
                        </LocationCard>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col md={4} style={{ padding: 15 }}>
                        <div style={{ position: "sticky", top: 25 }}>
                            <div
                                style={{
                                    fontFamily: "Jost",
                                    color: this.state.dark ? "whitesmoke" : "#333",
                                    padding: "10px 17px",
                                    border: "1px solid",
                                    borderColor: this.state.dark ? "#444" : "#dcdcdc",
                                    borderRadius: ".35rem",
                                    marginBottom: 10,
                                    background: this.state.dark ? "#1A1A1B" : "white",
                                    fontWeight: "bold",
                                    fontSize: "16pt"
                                }}
                            >
                                Lists
                                {
                                    this.state.hasLoaded && (
                                        <span style={{ float: "right" }}>
                                            {this.state.collections.length + 1}
                                        </span>
                                    )
                                }
                            </div>
                            <div style={{ maxHeight: "calc(100vh - 280px)", overflow: "auto", borderRadius: ".35rem" }}>
                                <div
                                    key="likes-list"
                                    style={{
                                        fontFamily: "Jost",
                                        color: this.state.dark ? "whitesmoke" : "#333",
                                        padding: "9px 11px",
                                        border: "1px solid",
                                        borderRadius: ".35rem",
                                        marginBottom: 5
                                    }}
                                    className={cx(this.state.dark ? css`
                                        background: ${this.state.likesIsActive ? "var(--danger)" : "inherit"};
                                        border-color: black !important;
                                    ` : css`
                                        background: ${this.state.likesIsActive ? "var(--danger)" : "inherit"};
                                        border-color: rgb(246, 248, 250) !important;
                                    `, css`
                                        ${this.state.likesIsActive && "color: white !important;"}
                                        .side-highlight {
                                            /* transition: all .2s; */
                                        }
                                        &:hover {
                                            cursor: pointer;
                                            border-color: ${this.state.dark ? "#444" : "#dcdcdc"} !important;
                                            .side-highlight {
                                                width: 5px;
                                            }
                                        }
                                    `)}
                                    onClick={this.setLikesActive}
                                >
                                    {/*
                                    <div
                                        className="side-highlight"
                                        style={{
                                            height: 35,
                                            borderRadius: ".35rem",
                                            background: "var(--primary)",
                                            position: "absolute",
                                            left: 1,
                                            marginTop: -5
                                        }}
                                    />
                                    */}
                                    <Heart
                                        size={15}
                                        fill={this.state.likesIsActive ? "white" : "var(--danger)"}
                                        color={this.state.likesIsActive ? "white" : "var(--danger)"}
                                        style={{ position: "relative", bottom: 1.5 }}
                                    />
                                    &nbsp;
                                    Your Likes
                                </div>
                                {
                                    this.state.collections.map((x, i) => {
                                        const isActive = this.state.activeList && this.state.activeList.list.id === x.id;
                                        return (
                                            <div
                                                key={x.id}
                                                style={{
                                                    fontFamily: "Jost",
                                                    color: this.state.dark ? "whitesmoke" : "#333",
                                                    padding: "9px 11px",
                                                    border: "1px solid",
                                                    borderRadius: ".35rem",
                                                    marginBottom: 5
                                                }}
                                                className={cx(this.state.dark ? css`
                                                    background: ${isActive ? "var(--primary)" : "inherit"};
                                                    border-color: black !important;
                                                ` : css`
                                                    background: ${isActive ? "var(--primary)" : "inherit"};
                                                    ${isActive && "color: whitesmoke !important;"}
                                                    border-color: rgb(246, 248, 250) !important;
                                                `, css`
                                                    &:hover {
                                                        cursor: pointer;
                                                        border-color: ${this.state.dark ? "#444" : "#dcdcdc"} !important;
                                                    }
                                                `)}
                                                onClick={() => this.setActiveList(x)}
                                            >
                                                <Folder
                                                    size={15}
                                                    fill={this.state.activeList && this.state.activeList.list.id === x.id ? "white" : "#54aeff"}
                                                    color={this.state.activeList && this.state.activeList.list.id === x.id ? "white" : "#54aeff"}
                                                    style={{ position: "relative", bottom: 1.5 }}
                                                />
                                                &nbsp;&nbsp;
                                                {x.header}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <hr style={{ borderColor: this.state.dark ? "#444" : "#dcdcdc", marginTop: 0 }} />
                            <div
                                style={{
                                    fontFamily: "Jost",
                                    color: this.state.dark ? "whitesmoke" : "#333",
                                    padding: "10px 12px",
                                    border: "2px solid",
                                    borderRadius: ".35rem",
                                    marginBottom: 5
                                }}
                                className={cx(this.state.dark ? css`
                                    border-color: #444 !important;
                                ` : css`
                                    border-color: #dcdcdc !important;
                                `, css`
                                    &:hover {
                                        cursor: pointer;
                                        padding: 9px 11px !important;
                                        border-width: 3px !important;
                                        border-color: ${this.state.dark ? "#555" : "#dcdcdc"} !important;
                                        background: ${this.state.dark ? "#333" : "whitesmoke"} !important;
                                    }
                                `)}
                                onClick={this.createCollection}
                            >
                                {
                                    this.state.hasLoaded ? (
                                        <>
                                            <FolderPlus
                                                size={16}
                                                style={{ position: "relative", bottom: 1.5 }}
                                            />
                                            &nbsp;
                                            Create List
                                        </>
                                    ) : (
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            <BounceLoader color={this.state.dark ? "whitesmoke" : "#666"} size={24} />
                                        </div>
                                    )
                                }
                            </div>
                            <ListGroup style={{ fontFamily: "Jost" }} hidden>
                                <ListGroup.Item
                                    style={{
                                        background: this.state.dark ? "#1A1A1B" : "whitesmoke",
                                        color: this.state.dark ? "whitesmoke" : "#333",
                                        border: this.state.dark ? "1px solid #444" : "1px solid #dcdcdc",
                                        padding: "12px 8px 0px 18px"
                                    }}
                                >
                                    <h4 style={{ margin: 0 }}>
                                        <span style={{ position: "relative", top: 2 }}>
                                            Your Lists
                                        </span>
                                        <span style={{ float: "right" }}>
                                            <OverlayTrigger
                                                placement="bottom"
                                                overlay={(
                                                    <Tooltip id="add-list-btn">
                                                        New List
                                                    </Tooltip>
                                                )}
                                            >
                                                <Button variant="light"
                                                    style={{
                                                        borderRadius: ".35rem", border: "3px solid",
                                                        position: "relative", bottom: 6,
                                                        fontWeight: "bold", color: this.state.dark ? "whitesmoke" : "#333",
                                                        borderColor: this.state.dark ? "#444" : "#dcdcdc"
                                                    }}
                                                    className={cx(css`
                                                        background: ${this.state.dark ? "#1A1A1B" : "white"};
                                                    `, this.state.dark && css`
                                                        &:hover {
                                                            background: #444 !important;
                                                        }
                                                    `)}
                                                    onClick={this.createCollection}
                                                >
                                                    <FolderPlus size={20} style={{ position: "relative", bottom: 2 }} />
                                                </Button>
                                            </OverlayTrigger>
                                        </span>
                                    </h4>
                                </ListGroup.Item>
                                <div
                                    style={{
                                        maxHeight: "calc(100vh - 106px)",
                                        borderBottom: "1px solid",
                                        overflowY: "auto",
                                        borderColor: this.state.dark ? "#444" : "#dcdcdc",
                                        borderRadius: "0px 0px .35rem .35rem"
                                    }}
                                >
                                    <ListGroup.Item
                                        className={cx(this.state.dark ? css`
                                            background: ${this.state.likesIsActive ? "#333" : "black"};
                                            color: whitesmoke;
                                            border: 1px solid #444;
                                            &:hover {
                                                cursor: pointer;
                                                background: #333;
                                            }
                                        ` : css`
                                            background: ${this.state.likesIsActive ? "whitesmoke" : "white"};
                                            color: #333;
                                            border: 1px solid #dcdcdc;
                                            &:hover {
                                                cursor: pointer;
                                                background: whitesmoke;
                                            }
                                        `)}
                                        style={{ padding: "10px 20px", borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
                                        onClick={this.setLikesActive}
                                    >
                                        <Heart
                                            size={15}
                                            fill={this.state.likesIsActive ? "var(--danger)" : "#999"}
                                            color={this.state.likesIsActive ? "var(--danger)" : "#999"}
                                            style={{ position: "relative", bottom: 1.5 }}
                                        />
                                        &nbsp;&nbsp;
                                        Your Likes
                                    </ListGroup.Item>
                                    {
                                        this.state.collections.map((x, i) => (
                                            <ListGroup.Item
                                                className={cx(this.state.dark ? css`
                                                    background: ${this.state.activeList && this.state.activeList.list.id === x.id ? "#333" : "black"};
                                                    color: whitesmoke;
                                                    border: 1px solid #444;
                                                    &:hover {
                                                        cursor: pointer;
                                                        background: #333;
                                                    }
                                                ` : css`
                                                    background: ${this.state.activeList && this.state.activeList.list.id === x.id ? "whitesmoke" : "white"};
                                                    color: #333;
                                                    border: 1px solid #dcdcdc;
                                                    &:hover {
                                                        cursor: pointer;
                                                        background: whitesmoke;
                                                    }
                                                `)}
                                                style={{ padding: "10px 20px", borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
                                                onClick={() => this.setActiveList(x)}
                                            >
                                                {/*
                                                    this.state.activeList && this.state.activeList.list.id === x.id ?
                                                    <BookOpen size={15} fill={ this.state.dark ? "white" : "#999"} color={ this.state.dark ? "white" : "#999"} style={{ position: "relative", bottom: 1.5 }}/>
                                                    : <Folder size={15} fill="#54aeff" color="#54aeff" style={{ position: "relative", bottom: 1.5 }}/>
                                                */}
                                                <Folder
                                                    size={15}
                                                    fill={this.state.activeList && this.state.activeList.list.id === x.id ? "#54aeff" : "#999"}
                                                    color={this.state.activeList && this.state.activeList.list.id === x.id ? "#54aeff" : "#999"}
                                                    style={{ position: "relative", bottom: 1.5 }}
                                                />
                                                &nbsp;&nbsp;
                                                {x.header}
                                            </ListGroup.Item>
                                        ))
                                    }
                                    {
                                        !this.state.hasLoaded && (
                                            <ListGroup.Item
                                                style={{
                                                    textAlign: "center",
                                                    borderTopLeftRadius: 0,
                                                    borderTopRightRadius: 0
                                                }}
                                                className={cx(this.state.dark ? css`
                                                    background: black;
                                                    color: whitesmoke;
                                                    padding: 10px 20px;
                                                    border: 1px solid #444;
                                                ` : css`
                                                    background: white;
                                                    color: #333;
                                                    padding: 10px 20px;
                                                    border: 1px solid #dcdcdc;
                                                `)}
                                            >
                                                <PulseLoader color="#999" size={10} />
                                            </ListGroup.Item>
                                        )
                                    }
                                </div>
                            </ListGroup>
                            <Footnote dark={this.state.dark} />
                        </div>
                        <Modal
                            show={this.state.showDeleteModal}
                            size="sm"
                            style={{ fontFamily: "Jost" }}
                            className={cx(css`
                                .modal-content{
                                    border: 5px solid ${this.state.dark ? "#444" : "#dcdcdc"};
                                    borderRadius: 0.35rem;
                                }
                            `)}
                            centered
                        >
                            <Modal.Body
                                style={{ fontSize: "16pt" }}
                                className={cx(this.state.dark && css`
                                    background: #1A1A1B;
                                    color: whitesmoke;
                                `)}
                            >
                                {
                                    this.state.deleting ? (
                                        <div style={{ height: 40, width: 40, marginTop: 10, marginBottom: 10, display: "table", marginLeft: "auto", marginRight: "auto" }}>
                                            <BounceLoader loading={true} color="#666" size={40} />
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ margin: 5, textAlign: "center" }}>
                                                Are you sure?
                                            </div>
                                            <div style={{ padding: 10 }}>
                                                <Button
                                                    variant="outline-secondary"
                                                    style={{ borderWidth: 3, borderRadius: ".35rem", width: "calc(50% - 2.5px)", marginRight: 5 }}
                                                    onClick={() => { this.setState({ showDeleteModal: false }); }}
                                                >
                                                    Keep
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    style={{ borderWidth: 3, borderRadius: ".35rem", width: "calc(50% - 2.5px)" }}
                                                    onClick={() => { this.setState({ deleting: true }); this.deleteActiveList(); }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </>
                                    )
                                }
                            </Modal.Body>
                        </Modal>
                    </Col>
                    <Col md={8} style={{ padding: 15 }}>
                        {
                            this.state.activeList === null && !this.state.likesIsActive && (
                                <div
                                    className={cx("text-center list-group-item-primary",
                                        (this.state.dark && css`
                                            background: #444;
                                            color: whitesmoke;
                                        `)
                                    )}
                                    style={{ borderRadius: ".35rem", display: "flex", justifyContent: "center", alignItems: "center", height: 250, fontFamily: "Jost" }}
                                >
                                    <div>
                                        <ArrowLeft style={{ position: "relative", bottom: 2 }} />&nbsp;&nbsp;Click on a List to view
                                    </div>
                                </div>
                            )
                        }
                        {
                            this.state.likesIsActive && (
                                <>
                                    <ListGroup style={{ fontFamily: "Jost" }}>
                                        <ListGroup.Item
                                            style={{
                                                background: this.state.dark ? "#1A1A1B" : "white",
                                                color: this.state.dark ? "whitesmoke" : "#333",
                                                border: "1px solid",
                                                borderColor: this.state.dark ? "#444" : "#dcdcdc",
                                                padding: "20px 20px 25px 20px", borderRadius: ".35rem"
                                            }}
                                            className={cx(css`
                                                hr {
                                                    border-color: ${this.state.dark ? "#444" : "#dcdcdc"};
                                                }
                                            `)}
                                        >
                                            <h3 style={{ margin: 5, marginBottom: 0, fontWeight: "bold" }}>
                                                <Heart size={26} color="var(--danger)" fill="var(--danger)" style={{ position: "relative", bottom: 2 }} />
                                                &nbsp;&nbsp;
                                                Your Likes
                                            </h3>
                                        </ListGroup.Item>
                                    </ListGroup>
                                    <br />
                                    {
                                        !this.state.likedGuides ? <TimelineCardSkeleton dark={this.state.dark} /> : (
                                            this.state.likedGuides.length === 0 ? (
                                                <>
                                                    <div
                                                        className={cx("text-center list-group-item-secondary",
                                                            (this.state.dark && css`
                                                                background: #444;
                                                                color: whitesmoke;
                                                            `)
                                                        )}
                                                        style={{ borderRadius: ".35rem", padding: 40, fontFamily: "Jost" }}
                                                    >
                                                        This list is empty!
                                                    </div>
                                                    <br />
                                                </>
                                            ) : this.state.likedGuides.map(g => <TimelineCard key={g.id} guide={g} dark={this.state.dark} />)
                                        )
                                    }
                                </>
                            )
                        }
                        {
                            this.state.activeList && !this.state.likesIsActive && (
                                <ListGroup style={{ fontFamily: "Jost" }}>
                                    <ListGroup.Item
                                        style={{
                                            background: this.state.dark ? "#1A1A1B" : "white",
                                            color: this.state.dark ? "whitesmoke" : "#333",
                                            border: "1px solid",
                                            borderColor: this.state.dark ? "#444" : "#dcdcdc",
                                            padding: 20, borderRadius: ".35rem"
                                        }}
                                        className={cx(css`
                                            hr {
                                                border-color: ${this.state.dark ? "#444" : "#dcdcdc"};
                                            }
                                        `)}
                                    >
                                        <h3 style={{ margin: 5, marginBottom: 0, fontWeight: "bold" }}>
                                            <Folder size={26} color="#54aeff" fill="#54aeff" style={{ position: "relative", bottom: 2 }} />
                                            &nbsp;&nbsp;
                                            {this.state.activeList && this.state.activeList.list.header}
                                        </h3>
                                        {
                                            this.state.activeList.list.description && (
                                                <>
                                                    <br />
                                                    <p style={{ color: this.state.dark ? "whitesmoke" : "#333", paddingLeft: 10 }}>
                                                        {this.state.activeList.list.description}
                                                    </p>
                                                </>
                                            )
                                        }
                                        <hr />
                                        <span
                                            className={cx(Styles.nav_icon, this.state.dark ? Styles.nav_icon_dark : Styles.nav_icon_light)}
                                            onClick={this.toggleGuideSearch}
                                        >
                                            &nbsp;
                                            <Plus />
                                            &nbsp;
                                            Add Guides
                                            &nbsp;
                                        </span>
                                        &nbsp;
                                        <span
                                            className={cx(Styles.nav_icon, this.state.dark ? Styles.nav_icon_dark : Styles.nav_icon_light)}
                                            onClick={() => {
                                                const actionState = this.state.actionState;
                                                actionState.showEditModal = true;
                                                this.setState({ actionState: actionState });
                                            }}
                                        >
                                            &nbsp;&nbsp;
                                            <Edit3 size={18} />
                                            &nbsp;&nbsp;
                                            Edit
                                            &nbsp;
                                        </span>
                                        &nbsp;
                                        <span
                                            className={cx(Styles.nav_icon, this.state.dark ? Styles.nav_icon_dark : Styles.nav_icon_light)}
                                            onClick={() => this.setState({ showDeleteModal: true })}
                                        >
                                            &nbsp;&nbsp;
                                            <Trash2 size={18} />
                                            &nbsp;&nbsp;
                                            Delete
                                            &nbsp;
                                        </span>
                                        &nbsp;
                                        <OverlayTrigger
                                            placement="bottom"
                                            overlay={(
                                                <Tooltip id="list-visibility-toggle-tooltip">
                                                    {
                                                        this.state.actionState.togglingVisibility ? "Loading..." :
                                                            `Click to make ${this.state.activeList.list.isPrivate ? "Public" : "Private"}`
                                                    }
                                                </Tooltip>
                                            )}
                                        >
                                            <span
                                                className={cx(Styles.nav_icon, this.state.dark ? Styles.nav_icon_dark : Styles.nav_icon_light)}
                                                onClick={this.togglePrivate}
                                                style={{ width: 40 }}
                                            >
                                                &nbsp;
                                                {
                                                    this.state.actionState.togglingVisibility ? <BounceLoader size="18" color={this.state.dark ? "whitesmoke" : "#333"} /> :
                                                        this.state.activeList.list.isPrivate === true ? <EyeOff size={18} /> : <Eye size={18} />
                                                }
                                                &nbsp;
                                            </span>
                                        </OverlayTrigger>
                                        &nbsp;
                                        <OverlayTrigger
                                            placement="bottom"
                                            overlay={(
                                                <Tooltip id="panel-link-tooltip">
                                                    {
                                                        !this.state.copied ? "Copy Share Link" :
                                                            <span style={{ fontWeight: "bold" }}>Copied!</span>
                                                    }
                                                </Tooltip>
                                            )}
                                        >
                                            <span
                                                className={cx(Styles.nav_icon, this.state.dark ? Styles.nav_icon_dark : Styles.nav_icon_light)}
                                                onClick={this.copyGuideLink}
                                                style={{ width: 40 }}
                                            >
                                                &nbsp;
                                                <LinkIcon size={18} />
                                                &nbsp;
                                            </span>
                                        </OverlayTrigger>
                                        {
                                            this.state.actionState.showGuideSearch && (
                                                <>
                                                    <hr />
                                                    <div style={{ margin: 10 }}>
                                                        <h6 style={{ fontWeight: "bold" }}>Let's find a guide for your List (Click to Add)</h6>
                                                        <Form onSubmit={this.searchForGuide}>
                                                            <Form.Control
                                                                placeholder="Search for a Guide"
                                                                id="search-field"
                                                                className={cx(this.state.dark && css`
                                                                    &, &:active, &:focus {
                                                                        background: rgba(255, 255, 255, 0.2);
                                                                        border-color: #444;
                                                                        color: whitesmoke;
                                                                    }
                                                                `)}
                                                            />
                                                        </Form>
                                                        {
                                                            this.state.actionState.isSearching ? (
                                                                <>
                                                                    <br /><br />
                                                                    <div style={{ height: 50, width: 50, margin: "auto" }}>
                                                                        <BounceLoader size={50} color={this.state.dark ? "whitesmoke" : "#666"} />
                                                                    </div>
                                                                    <br />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {!!this.state.searchResults.length && <br />}
                                                                    {!this.state.searchResults.length && this.state.lastSearch && (
                                                                        <>
                                                                            <br />
                                                                            <div
                                                                                className={cx("text-center list-group-item-danger",
                                                                                    (this.state.dark && css`
                                                                                        background: #444;
                                                                                        color: whitesmoke;
                                                                                    `)
                                                                                )}
                                                                                style={{ borderRadius: ".35rem", padding: 20, fontFamily: "Jost" }}
                                                                            >
                                                                                <span style={{ fontSize: "1rem" }}>No results found for...</span>
                                                                                <br />
                                                                                <div style={{ fontWeight: "bold", fontSize: "1.4rem", wordBreak: "break-all", marginTop: 10 }}>
                                                                                    {this.state.lastSearch}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )
                                                                    }
                                                                    {
                                                                        this.state.searchResults.map(x =>
                                                                            <GuideToggle
                                                                                guide={x.g}
                                                                                dark={this.state.dark}
                                                                                state={x.active}
                                                                                list={this.state.activeList?.list!}
                                                                                toggle={this.toggleActiveSearchResult}
                                                                            />
                                                                        )
                                                                    }
                                                                </>
                                                            )
                                                        }
                                                    </div>
                                                </>
                                            )
                                        }
                                    </ListGroup.Item>
                                </ListGroup>
                            )
                        }
                        <br />
                        {
                            this.state.activeList?.guides === null ? (
                                <TimelineCardSkeleton dark={this.state.dark} />
                            ) : (
                                this.state.activeList?.guides.length === 0 ? (
                                    <>
                                        <div
                                            className={cx("text-center list-group-item-secondary",
                                                (this.state.dark && css`
                                                    background: #444;
                                                    color: whitesmoke;
                                                `)
                                            )}
                                            style={{ borderRadius: ".35rem", padding: 40, fontFamily: "Jost" }}
                                        >
                                            { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                            This list is empty! <a href="#" style={{ color: this.state.dark ? "whitesmoke" : "#333", textDecoration: "underline" }} onClick={this.newGuideInActiveList}>Create a guide here.</a>
                                        </div>
                                        <br />
                                    </>
                                ) : this.state.activeList?.guides.map(
                                    g => <TimelineCard guide={g} dark={this.state.dark} />
                                )
                            )
                        }
                        {
                            this.state.activeList
                            && this.state.activeList.guides
                            && this.state.activeList.guides.length > 0
                            && (
                                <Button
                                    variant="outline-secondary"
                                    hidden={this.state.activeList?.guides === null}
                                    style={{
                                        borderRadius: ".7rem",
                                        width: "100%",
                                        borderWidth: 4,
                                        padding: "30px 10px",
                                        fontFamily: "Jost"
                                    }}
                                    className={cx(css`
                                        &, &:hover, &:active {
                                            border-color: #dcdcdc;
                                            background: transparent;
                                            color: var(--secondary);
                                        }
                                        & > svg {
                                            transition: all .25s;
                                        }
                                        &:hover {
                                            border-color: var(--secondary);
                                            & > svg {
                                                transform: scale(1.2);
                                            }
                                        }
                                    `)}
                                    onClick={this.newGuideInActiveList}
                                    disabled={this.state.actionState.isCreatingGuide}
                                >
                                    {
                                        this.state.actionState.isCreatingGuide ? (
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <BounceLoader size={40} color={this.state.dark ? "whitesmoke" : "#666"} />
                                            </div>
                                        ) : <Plus size={40} />
                                    }
                                </Button>
                            )
                        }
                        <br />
                    </Col>
                </Row>
            </Template>
        )
    }

}