import React from "react";

import { cx, css } from "@emotion/css";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";

import Template from "../../common/template"
import TimelineCard from "../../common/timeline_card/timeline_card";
import TimelineCardSkeleton from "../../common/timeline_card/timeline_card_skeleton";
import Styles from "./home_styles";
import { Home as HomeIcon, Layout } from "react-feather";
import LocationCard from "../../common/location_card";
import ProfileCard from "../../common/profile_card/profile_card";

import { CognitoUser } from 'amazon-cognito-identity-js';
import UserHandler from "../../common/UserHandler";
import TopGuidesWidget from "../../common/top_guides_widget";
import config from "../../../config";
import CommonType from "../../common/types";
import PageBP from "../../common/PageBP/PageBP";
import { Footnote } from "../../common/footnote";
import ListHandler from "../../common/ListHandler";

type PackedGuide = {
    id: string,
    blocks: any[],
    header: string,
    description: string,
    timestamp: string,
    user: string,
    views: number,
    likes: number | null,
    isPrivate: boolean
};
type Guide = {
    id: string,
    blocks: any[],
    header: string,
    description: string,
    timestamp: Date,
    user: string,
    views: number,
    likes: number | null,
    isPrivate: boolean
}

enum ActiveState {
    ON,
    PENDING,
    OFF
};

type State = {
    dark: boolean,
    guides: Guide[],
    user: null | CognitoUser,
    redirectToLogin: boolean,
    hasLoaded: boolean,
    wallLayout: boolean,
    lists: ({
        l: CommonType.List,
        activeState: ActiveState[]
    })[] | null,
    listHandler: ListHandler | null
};
type Props = {};


export default class Home extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: this.localStorage!.getItem("darkmode") === "true",
            guides: [],
            user: (new UserHandler()).getUser(),
            redirectToLogin: false,
            hasLoaded: false,
            wallLayout: false,
            lists: null,
            listHandler: null
        };

        this.init();
    }

    init() {
        fetch(config.endpoints.getAllGuides)
            .then(res => {
                if (res.status !== 200) return Promise.reject(res);
                return res.json();
            })
            .then(data => {
                const guides: Guide[] =
                    data.map((x: PackedGuide) => this.unpackGuide(x))
                        .sort((x: Guide, y: Guide) => {
                            return y.timestamp.getTime() - x.timestamp.getTime();
                        });

                this.setState({
                    guides: guides,
                    hasLoaded: true,
                    listHandler: !this.state.user ? null :
                        new ListHandler(
                            this.state.user.getUsername(),
                            guides,
                            this.forceUpdate.bind(this)
                        )
                });
            });
    }

    unpackGuide(x: PackedGuide): Guide {
        return {
            id: x.id,
            header: x.header,
            description: x.description,
            blocks: x.blocks,
            timestamp: new Date(x.timestamp),
            user: x.user,
            views: x.views,
            likes: x.likes,
            isPrivate: x.isPrivate
        };
    }

    locationCard = () => (
        <LocationCard dark={this.state.dark}>
            <HomeIcon size={14} style={{ marginBottom: 3 }} />&nbsp;
            <strong>Home {this.state.user ? (<span>({this.state.user.getUsername()})</span>) : null}</strong>
            <span style={{ float: "right" }}>
                <OverlayTrigger
                    trigger="hover"
                    placement="bottom"
                    overlay={
                        <Tooltip id="toggle-layout-tooltip">
                            Toggle Layout
                        </Tooltip>
                    }
                >
                    <Layout
                        size={26}
                        className={cx(css`
                            padding: 5px;
                            border-radius: .35rem;
                            position: relative;
                            bottom: 2px;
                            &:hover { 
                                background: ${this.state.dark ? "#444" : "whitesmoke"};
                                cursor: pointer;
                            }
                        `)}
                        onClick={() => this.setState({ wallLayout: !this.state.wallLayout })}
                    />
                </OverlayTrigger>
            </span>
        </LocationCard>
    )

    render() {
        const isDark = this.state.dark;

        if (this.state.wallLayout) return (
            <Template dark={isDark} user={this.state.user} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                <Row>
                    <Col md={12}>
                        {this.locationCard()}
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col md={12}>
                        <div
                            className={cx(css`
                                column-count: 3;
                                @media(max-width: 992px) { column-count: 2; }
                                @media(max-width: 576px) { column-count: 1; }
                                column-gap: 20px;
                            `)}
                        >
                            {
                                this.state.guides.map((g, i) => (
                                    <div style={{ display: "inline-block", width: "100%" }}>
                                        <TimelineCard
                                            guide={g}
                                            dark={isDark}
                                            key={g.id}
                                            hideMore
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </Col>
                </Row>
            </Template>
        )

        return (
            <Template dark={isDark} user={this.state.user} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                <Row>
                    <Col md={8} sm={12}>
                        {this.locationCard()}
                        <br />
                        {
                            this.state.guides.map((g, i) =>
                                <TimelineCard
                                    guide={g}
                                    dark={isDark}
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
                            !this.state.hasLoaded && (<TimelineCardSkeleton dark={this.state.dark} />)
                        }
                        <br />
                    </Col>
                    <Col md={4} sm={0} className={cx(Styles.small_col_s)}>
                        <ProfileCard
                            dark={this.state.dark}
                            user={this.state.user}
                            hasLoaded={this.state.hasLoaded}
                            localStorage={this.localStorage!}
                            principalOwnsProfile
                        />
                        <br />
                        <TopGuidesWidget dark={this.state.dark} />
                        <Footnote dark={this.state.dark} />
                    </Col>
                </Row>
            </Template>
        )
    }
}