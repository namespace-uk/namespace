import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { css, cx } from "@emotion/css";
import CStyles from "../../common/common_styles";
import { Row, Col, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BookOpen, Clock, Folder, Heart, MapPin, User, UserPlus } from "react-feather";
import Template from "../../common/template";
import LocationCard from "../../common/location_card";
import Avatar from "boring-avatars";
import BounceLoader from "react-spinners/BounceLoader";
import TimelineCard from "../../common/timeline_card/timeline_card";
import TimelineCardSkeleton from "../../common/timeline_card/timeline_card_skeleton";
import TopGuidesWidget from "../../common/top_guides_widget";
import config from "../../../config";
import PageBP, { BPState } from "../../common/PageBP/PageBP";
import CommonType from "../../common/types";
import UserListWidget, { LoadingState } from "../../common/user_list_widget";
import { Footnote } from "../../common/footnote";
import ListHandler from "../../common/ListHandler";

type State = BPState & {
    profile: CommonType.ProfileData | null,
    guides: CommonType.Guide[],
    loadingState: LoadingState,
    likes: number | null,
    lists: CommonType.List[],
    listLoadingState: LoadingState,
    listHandler: ListHandler | null
};

interface MatchParams {
    username: string
}
interface Props extends RouteComponentProps<MatchParams> {
    children?: React.ReactNode
};

const Styles = {
    profile_widget_light_s: css`
        background: white;
        border-color: #dcdcdc !important;
    `,
    profile_widget_dark_s: css`
        background: #161616;
        border-color: #343434 !important;
        h3, .description-field {
            color: whitesmoke !important;
        }
        #stat-badges {
            background: black !important;
        }
    `,
    stat_badge_s: css`
        background: white;
        border-color: #dcdcdc !important;
        color: #666;
    `,
    stat_badge_s_dark: css`
        background: #161616;
        border-color: #343434 !important;
        color: whitesmoke;
    `
};

export default class Profile extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            ...this.defaults(),
            ...{
                profile: null,
                guides: [],
                loadingState: LoadingState.LOADING,
                likes: null,
                lists: [],
                listLoadingState: LoadingState.LOADING,
                listHandler: null
            }
        };

        this.init();
    }

    loadLists = async (username: string) => {
        await fetch(config.endpoints.getLists, {
            method: "POST",
            body: JSON.stringify({ username: username })
        })
            .then(res => res.json())
            .then(data => {
                this.setState({
                    lists: data.collections.filter((x: CommonType.List) => !x.isPrivate),
                    listLoadingState: LoadingState.DONE
                })
            });
    }

    async init() {
        const profileStr = this.localStorage!.getItem("profile");
        if (profileStr !== null) {
            const profile: CommonType.ProfileData = JSON.parse(profileStr);
            if (this.state.user && profile.username === this.state.user.getUsername()) {
                this.setState({ profile: profile });
            }
        }

        this.getProfile();
        /*if (user == null || user.getUsername() !== guide?.user) this.setState({ redirectToHome: true });
        else this.setState({ user: user, guide: guide, hasLoaded: true }, this.forceUpdate);*/
    }

    getProfile = () => {
        fetch(config.endpoints.getProfile, {
            method: "POST",
            body: JSON.stringify({
                username: this.props.match.params.username,
                failThrough: true
            })
        }).then(res => {
            if (res.status !== 200) return Promise.reject(res);
            return res.json();
        })
            .then(data => {
                data = data.body;
                const newState = {
                    profile: data.user,
                    guides: data.guides,
                    likes: data.guides.map((x: CommonType.Guide) => x.likes || 0).reduce((x: number, y: number) => x + y, 0),
                    loadingState: LoadingState.DONE,
                    listHandler: !this.state.user ? null :
                        new ListHandler(
                            this.state.user.getUsername(),
                            data.guides,
                            this.forceUpdate.bind(this)
                        )
                };
                this.loadLists(newState.profile.username);
                this.setState(newState);
            })
            .catch(err => {
                this.setState({ loadingState: LoadingState.FAILED });
                console.log("An error occured!");
                return null;
            });
    }

    static StatBadge: React.FC<{ tooltip: string, tooltipId: string, dark: boolean, children?: React.ReactNode }> = props => (
        <OverlayTrigger
            overlay={
                <Tooltip id={props.tooltipId}>
                    {props.tooltip}
                </Tooltip>
            }
            placement="bottom"
        >
            <div
                className={cx(props.dark ? Styles.stat_badge_s_dark : Styles.stat_badge_s)}
                style={{
                    border: "2px solid",
                    borderRadius: "var(--radius-md)",
                    padding: "3px 10px",
                    lineHeight: 1.5,
                    display: "inline-block"
                }}
            >
                {props.children}
            </div>
        </OverlayTrigger>
    )

    truncate(text: string, maxLength: number) {
        var ret = text;
        if (ret.length > maxLength) {
            ret = ret.slice(0, maxLength - 3) + "...";
        }
        return ret;
    }

    render() {
        if (this.state.loadingState === LoadingState.FAILED) return (
            <Template dark={this.state.dark} user={this.state.user} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                <Row>
                    <Col md={3} />
                    <Col md={6}>
                        <LocationCard dark={this.state.dark}>
                            <User size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>{this.props.match.params.username}</strong>
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
                            The user <span style={{ fontWeight: "bold" }}>{this.props.match.params.username}</span> does not exist
                            <br /><br />
                            <Link to="/" style={{ textDecoration: "underline", color: this.state.dark ? "whitesmoke" : undefined }}>Return to Home</Link>
                        </div>
                    </Col>
                    <Col md={3} />
                </Row>
            </Template>
        )

        return (
            <Template dark={this.state.dark} user={this.state.user} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                <Row>
                    <Col>
                        <LocationCard dark={this.state.dark}>
                            <User size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>{this.state.profile && `${this.state.profile.username}'s profile`}</strong>
                        </LocationCard>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                        <br /><br /><br /><br />
                        {(this.state.profile !== null) ? (
                            <div
                                style={{
                                    width: "100%",
                                    borderRadius: ".7rem",
                                    padding: "20px 40px",
                                    minHeight: 240,
                                    border: "3px solid"
                                }}
                                className={cx(css`
                                        @media(min-width: 768px) {
                                            height: 240px;
                                        }
                                    `, (this.state.dark ? Styles.profile_widget_dark_s : Styles.profile_widget_light_s))}
                            >
                                <div
                                    style={{ display: "inline-block", position: "absolute", top: 4, textAlign: "center" }}
                                    className={cx(css`
                                            @media(min-width: 768px) {
                                                left: 90px;
                                            }
                                            @media(max-width: 768px) {
                                                left: 50%;
                                                -webkit-transform: translateX(-50%);
                                                transform: translateX(-50%)
                                            }
                                        `)}
                                >
                                    <div
                                        style={{
                                            borderRadius: "50%", background: "whitesmoke",
                                            padding: 0, border: "8px solid",
                                            borderColor: (this.state.dark ? "#666" : "#dcdcdc")
                                        }}
                                    >
                                        <Avatar
                                            size={200}
                                            name={this.state.profile.username}
                                            variant="marble"
                                            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                        />
                                    </div>
                                    <h3 style={{ fontFamily: "Jost", fontWeight: "bold", marginTop: 15, color: "#343434", marginBottom: 5 }}>
                                        {this.state.profile.username}
                                    </h3>
                                    <p style={{ fontFamily: "Jost", color: "#666", fontSize: ".9rem" }}>
                                        <MapPin size={17} />
                                        &nbsp;
                                        {!!this.state.profile.location ? this.state.profile.location : "Earth"}
                                    </p>
                                </div>
                                <div
                                    className={cx(css`
                                            @media(min-width: 768px) {
                                                display: none;
                                            }
                                            width: 100%;
                                            text-align: center;
                                            padding: 15px 40px;
                                            margin-top: 180px;
                                            color: #666;
                                            font-family: Jost;
                                            line-height: 1.4;
                                        `, "description-field")}
                                >
                                    {this.truncate(this.state.profile.description, 300)}
                                </div>
                                <div
                                    style={{ width: "calc(100% - 280px)", height: "100%", position: "relative", left: 300 }}
                                    className={cx(css`
                                            @media(max-width: 768px) {
                                                display: none;
                                            }
                                        `)}
                                >
                                    <p
                                        style={{
                                            // textAlign: "center",
                                            fontFamily: "Jost",
                                            color: "#666",
                                            fontSize: "1.1rem",
                                            padding: "0px 10px",
                                            // position: "absolute", 
                                            overflow: "auto",
                                            // msTransform: "translateY(-50%)",
                                            // transform: "translateY(-50%)",
                                            height: "calc(100% - 55px)",
                                            // border: "1px solid #dcdcdc",
                                            // background: "whitesmoke",
                                            borderRadius: ".7rem",
                                            lineHeight: 1.3,
                                            margin: "0px 5px 10px 0px"
                                        }}
                                        className="description-field"
                                    >
                                        {this.state.profile.description || "This user prefers to stay anonymous!"}
                                    </p>
                                    <div
                                        id="stat-badges"
                                        style={{
                                            height: 50, padding: 8,
                                            background: "whitesmoke",
                                            borderRadius: ".7rem",
                                            fontFamily: "Jost",
                                            overflowY: "auto",
                                            whiteSpace: "nowrap",
                                            display: "flex",
                                            gap: 5
                                        }}
                                    >
                                        <Profile.StatBadge
                                            tooltip={`${this.state.guides.length} Guide(s)`}
                                            tooltipId="guide-count"
                                            dark={this.state.dark}
                                        >
                                            <BookOpen size={15} style={{ marginBottom: 2 }} />
                                            &nbsp;&nbsp;
                                            {this.state.guides.length}
                                        </Profile.StatBadge>
                                        <Profile.StatBadge
                                            tooltip={`${this.state.lists.length} List(s)`}
                                            tooltipId="list-count"
                                            dark={this.state.dark}
                                        >
                                            <Folder size={15} style={{ marginBottom: 3 }} />
                                            &nbsp;&nbsp;
                                            {this.state.lists.length}
                                        </Profile.StatBadge>
                                        <Profile.StatBadge
                                            tooltip={`${this.state.likes} Like(s)`}
                                            tooltipId="like-count"
                                            dark={this.state.dark}
                                        >
                                            <Heart size={15} style={{ marginBottom: 3 }} />
                                            &nbsp;&nbsp;
                                            {this.state.likes}
                                        </Profile.StatBadge>
                                        {
                                            this.state.profile.joined && (
                                                <Profile.StatBadge
                                                    tooltip={`Member since ${new Date(this.state.profile.joined).toDateString()}`}
                                                    tooltipId="when-joined"
                                                    dark={this.state.dark}
                                                >
                                                    <Clock size={15} style={{ marginBottom: 3 }} />
                                                    &nbsp;
                                                    {(new Date(this.state.profile.joined)).toDateString()}
                                                </Profile.StatBadge>
                                            )
                                        }
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            style={{
                                                borderWidth: 2,
                                                borderRadius: ".35rem",
                                                float: "right"
                                            }}
                                            className={cx(css`
                                                    &:not(:hover) {
                                                        background: white;
                                                    }
                                                `)}
                                            hidden
                                        >
                                            &nbsp;Edit&nbsp;
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    variant="outline-primary"
                                    style={{
                                        width: 200,
                                        display: "table",
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        borderRadius: ".35rem",
                                        fontFamily: "Jost",
                                        borderWidth: 3,
                                        marginTop: 20
                                    }}
                                    hidden
                                >
                                    <UserPlus size={20} style={{ position: "relative", bottom: 2 }} />
                                    &nbsp;
                                    Follow
                                </Button>
                            </div>
                        ) : (
                            <div style={{ height: 75, width: 75, marginTop: 40, marginBottom: 130, display: "table", marginLeft: "auto", marginRight: "auto" }}>
                                <BounceLoader loading={true} color={this.state.dark ? "whitesmoke" : "#666"} size={75} />
                            </div>
                        )
                        }
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col md={8} sm={12}>
                        {/*
                            false && (
                                <>
                                    <LocationCard dark={this.state.dark}>
                                        <Book size={14} style={{ marginBottom: 3 }} />&nbsp;
                                        <strong>{this.state.profile && `${this.state.profile!.username}'s Lists`}</strong>
                                    </LocationCard>
                                    <br/>
                                </>
                            )
                        */}
                        <LocationCard dark={this.state.dark}>
                            <BookOpen size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>{this.state.profile && `${this.state.profile.username}'s guides`}</strong>
                        </LocationCard>
                        <br />
                        {
                            this.state.guides.map((g, i) =>
                                <TimelineCard
                                    guide={g}
                                    dark={this.state.dark}
                                    moreData={this.state.listHandler && this.state.listHandler.getLists() !== null ? {
                                        lists: this.state.listHandler.getLists().map(x => ({
                                            l: x.list,
                                            activeState: x.activeState[i]
                                        })),
                                        index: i,
                                        toggleListInclude: this.state.listHandler!.toggleListInclude
                                    } : undefined}
                                />
                            )
                        }
                        {
                            (this.state.loadingState === LoadingState.DONE && this.state.guides.length === 0) && (
                                <div
                                    className={cx("text-center list-group-item-secondary",
                                        (this.state.dark && css`
                                            background: #343434;
                                            color: whitesmoke;
                                        `)
                                    )}
                                    style={{ borderRadius: ".35rem", padding: 40, fontFamily: "Jost" }}
                                >
                                    <span style={{ fontWeight: "bold" }}>{this.state.profile?.username}</span> has no guides yet!
                                </div>
                            )
                        }
                        {this.state.loadingState !== LoadingState.DONE && <TimelineCardSkeleton dark={this.state.dark} />}
                        <br />
                    </Col>
                    <Col md={4} sm={0} className={cx(CStyles.small_col_s)}>
                        <div style={{ position: "sticky", top: 25 }}>
                            <TopGuidesWidget dark={this.state.dark} />
                            <div style={{ height: 15 }} />
                            <UserListWidget
                                dark={this.state.dark}
                                lists={this.state.lists}
                                loadingState={this.state.listLoadingState}
                            />
                            <Footnote dark={this.state.dark} />
                        </div>
                        <br />
                    </Col>
                </Row>
            </Template>
        )
    }

}