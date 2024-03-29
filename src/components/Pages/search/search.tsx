import React from "react";

import { css, cx } from "@emotion/css";
import CStyles from "../../common/common_styles";

import Template from "../../common/template";
import { Col, Row } from "react-bootstrap";
import LocationCard from "../../common/location_card";
import { RouteComponentProps } from "react-router-dom";
import { Search } from "react-feather";
import ProfileCard from "../../common/profile_card/profile_card";
import BounceLoader from "react-spinners/BounceLoader";
import TopGuidesWidget from "../../common/top_guides_widget";
import { CognitoUser } from "amazon-cognito-identity-js";
import UserHandler from "../../common/UserHandler";
import config from "../../../config";
import TimelineCard from "../../common/timeline_card/timeline_card";
import PageBP from "../../common/PageBP/PageBP";
import { Footnote } from "../../common/footnote";
import typesense from "typesense";

const { v4: uuidv4 } = require("uuid");


type Guide = {
    id: string,
    header: string,
    description: string,
    timestamp: Date,
    user: string,
    views: number,
    likes: number | null,
    isPrivate: boolean,
    blocks: any[]
}

interface MatchParams {
    query: string;
}

interface Props extends RouteComponentProps<MatchParams> { };
type State = {
    dark: boolean,
    search_results: Guide[],
    search_is_done: boolean,
    user: CognitoUser | null
};

export default class SearchPage extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);


        this.state = {
            dark: this.localStorage!.getItem("darkmode") === "true",
            search_results: [],
            search_is_done: false,
            user: (new UserHandler()).getUser()
        };

        this.getSearchResultsData(this.props.match.params.query);
    }

    async init() { }

    getSearchResultsData = async (search_term: string) => {
        const client = new typesense.SearchClient(config.typesense_search_options);
        const res = await client.collections("guides").documents().search({
            "q": search_term,
            "query_by": "header"
        }, {});
        if (res.hits) this.setState({
            search_results: res.hits.map(x => x.document as Guide),
            search_is_done: true
        });
    }
    render() {
        return (
            <Template
                user={this.state.user}
                dark={this.state.dark}
                key={uuidv4()}
                setDarkMode={this.setDarkMode}
                defaultSearchValue={this.props.match.params.query}
                localStorage={this.localStorage!}
            >
                <Row>
                    <Col md={8} sm={12}>
                        <LocationCard dark={this.state.dark}>
                            <Search size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Search</strong>
                        </LocationCard>
                        <br />
                        {
                            this.state.search_is_done ? (this.state.search_results.length === 0 ? (
                                <div
                                    className={cx("text-center list-group-item-danger",
                                        (this.state.dark && css`
                                            background: #444;
                                            color: whitesmoke;
                                        `)
                                    )}
                                    style={{ borderRadius: ".35rem", padding: 40, fontFamily: "Jost" }}
                                >
                                    <span style={{ fontSize: "1rem" }}>No results found for...</span>
                                    <br />
                                    <br />
                                    <div style={{ fontWeight: "bold", fontSize: "2rem", wordBreak: "break-all" }}>{this.props.match.params.query}</div>
                                </div>
                            ) : (
                                <div>
                                    {
                                        this.state.search_results.map(g => <TimelineCard guide={g} dark={this.state.dark} />)
                                    }
                                </div>
                            )) : (
                                <div>
                                    <div style={{ height: 100, width: 100, marginTop: 50, marginBottom: 30, display: "table", marginLeft: "auto", marginRight: "auto" }}>
                                        <BounceLoader loading={true} color="#666" size={100} />
                                    </div>
                                </div>
                            )
                        }
                        <br />
                    </Col>
                    <Col md={4} sm={0} className={cx(CStyles.small_col_s)}>
                        <ProfileCard user={this.state.user} dark={this.state.dark} localStorage={this.localStorage!} hasLoaded />
                        <br />
                        <TopGuidesWidget dark={this.state.dark} />
                        <Footnote dark={this.state.dark} />
                    </Col>
                </Row>
            </Template>
        )
    }

}