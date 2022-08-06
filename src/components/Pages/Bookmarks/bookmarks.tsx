import React from "react";

import { css, cx } from "@emotion/css";
import CommonStyles from "../../common/common_styles";

import Template from "../../common/template";
import ProfileCard from '../../common/profile_card/profile_card';
import { Row, Col } from "react-bootstrap";
import { Bookmark } from "react-feather";
import TimelineCardSkeleton from "../../common/timeline_card/timeline_card_skeleton";
import LocationCard from "../../common/location_card";
import { Redirect } from "react-router-dom";
import config from "../../../config";
import TimelineCard from "../../common/timeline_card/timeline_card";
import PageBP, { BPState } from "../../common/PageBP/PageBP";
import { Footnote } from "../../common/footnote";
import ListHandler from "../../common/ListHandler";

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

type State = BPState & {
    hasLoaded: boolean,
    guides: Guide[],
    listHandler: ListHandler | null
};
type Props = {};

export default class Bookmarks extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            ...this.defaults(),
            ...{
                hasLoaded: false,
                guides: [],
                listHandler: null
            }
        };

        this.init();
    }

    init() {
        if (!this.state.user) return;
        const username = this.state.user.getUsername();

        fetch(config.endpoints.getBookmarks, {
            method: "POST",
            body: JSON.stringify({
                username: username
            })
        }).then(res => res.json())
            .then(data => {
                this.setState({
                    guides: data.bookmarks,
                    hasLoaded: true,
                    listHandler: new ListHandler(username, data.bookmarks, this.forceUpdate.bind(this))
                });
            })
    }

    render() {
        if (!this.state.user) return (<Redirect to="/auth/login" />);
        console.log(this.state.listHandler);
        if (this.state.listHandler) console.log(this.state.listHandler!.getLists());

        return (
            <Template dark={this.state.dark} user={this.state.user} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                <Row>
                    <Col md={8} sm={12}>
                        <LocationCard dark={this.state.dark}>
                            <Bookmark size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Bookmarks</strong>
                        </LocationCard>
                        <br />
                        {
                            this.state.hasLoaded ? (
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
                            ) : <TimelineCardSkeleton dark={this.state.dark} />
                        }
                        {
                            (this.state.hasLoaded && this.state.guides.length === 0) && (
                                <div
                                    className={cx("text-center list-group-item-primary",
                                        (this.state.dark && css`
                                            background: #444;
                                            color: whitesmoke;
                                        `)
                                    )}
                                    style={{ borderRadius: ".35rem", padding: 40, fontFamily: "Jost" }}
                                >
                                    You don't have any bookmarks yet!
                                </div>
                            )
                        }
                        <br />
                    </Col>
                    <Col md={4} sm={0} className={cx(CommonStyles.small_col_s)}>
                        <ProfileCard user={this.state.user} dark={this.state.dark} localStorage={this.localStorage!} hasLoaded />
                        <br />
                        {
                            (this.state.hasLoaded && this.state.guides.length > 0) && (
                                <div
                                    className={cx("text-center list-group-item-primary",
                                        (this.state.dark && css`
                                            background: #444;
                                            color: whitesmoke;
                                        `)
                                    )}
                                    style={{ borderRadius: ".35rem", padding: 20, fontFamily: "Jost" }}
                                >
                                    You have {this.state.guides.length} bookmark{this.state.guides.length > 1 && "s"}.
                                </div>
                            )
                        }
                        <Footnote dark={this.state.dark} />
                        <br />
                    </Col>
                </Row>
            </Template>
        )
    }
}