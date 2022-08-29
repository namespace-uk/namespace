import { css, cx } from "@emotion/css";
import { Col, ListGroup, Row } from "react-bootstrap";
import { Folder } from "react-feather";
import { Link, RouteComponentProps } from "react-router-dom";
import config from "../../config";
import LocationCard from "../common/location_card";
import PageBP, { BPState } from "../common/PageBP/PageBP";
import ProfileCard from "../common/profile_card/profile_card";
import Template from "../common/template";
import TimelineCard from "../common/timeline_card/timeline_card";
import TimelineCardSkeleton from "../common/timeline_card/timeline_card_skeleton";
import CommonType from "../common/types";
import UserHandler from "../common/UserHandler";
import Skeleton from "react-loading-skeleton";

interface MatchParams { id: string; }
interface Props extends RouteComponentProps<MatchParams> { };

type State = BPState & {
    list: CommonType.List | null,
    guides: CommonType.Guide[],
    hasLoaded: boolean
};

export default class List extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: this.localStorage!.getItem("darkmode") === "true",
            user: (new UserHandler()).getUser(),
            guides: [],
            list: null,
            hasLoaded: false
        };

    }

    init() {
        fetch(config.endpoints.getList(this.props.match.params.id))
            .then(res => res.json())
            .then(data => this.setState({
                list: data.list,
                guides: data.guides,
                hasLoaded: true
            }));
    }

    render() {
        return (
            <Template
                dark={this.state.dark}
                setDarkMode={this.setDarkMode}
                user={this.state.user}
                localStorage={this.localStorage!}
            >
                <Row>
                    <Col md={8}>
                        <LocationCard dark={this.state.dark}>
                            <Folder size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>List</strong>
                        </LocationCard>
                        <br />
                        <ListGroup style={{ fontFamily: "Jost" }}>
                            {
                                this.state.hasLoaded && !this.state.list && (
                                    <div
                                        className={cx("text-center list-group-item-secondary",
                                            (this.state.dark && css`
                                            background: #343434;
                                            color: whitesmoke;
                                        `)
                                        )}
                                        style={{ borderRadius: ".35rem", padding: 40, fontFamily: "Jost" }}>
                                        List not found! <Link to="/"
                                            style={{
                                                color: this.state.dark ? "whitesmoke" : "black",
                                                textDecoration: "underline"
                                            }}>Return to Home</Link>
                                    </div>
                                )
                            }
                            {
                                !this.state.hasLoaded && (
                                    <div>
                                        <ListGroup.Item
                                            style={{
                                                background: this.state.dark ? "#161616" : "white",
                                                color: this.state.dark ? "whitesmoke" : "#333",
                                                border: "1px solid", textAlign: "center",
                                                borderColor: this.state.dark ? "#343434" : "#dcdcdc",
                                                padding: 8, borderRadius: ".35rem"
                                            }}
                                            className={cx(this.state.dark && css`
                                                .react-loading-skeleton {
                                                    background-color: #333;
                                                }
                                            `)}
                                        >
                                            <h1 style={{ marginBottom: 0 }}>
                                                <Skeleton width={300} />
                                            </h1>
                                        </ListGroup.Item>
                                        <br />
                                        <TimelineCardSkeleton dark={this.state.dark} />
                                    </div>
                                )
                            }
                            {
                                this.state.list && (
                                    <ListGroup.Item
                                        style={{
                                            background: this.state.dark ? "#161616" : "white",
                                            color: this.state.dark ? "whitesmoke" : "#333",
                                            border: "1px solid", textAlign: "center",
                                            borderColor: this.state.dark ? "#343434" : "#dcdcdc",
                                            padding: "20px 20px 25px 20px", borderRadius: ".35rem"
                                        }}
                                        className={cx(css`
                                            hr {
                                                border-color: ${this.state.dark ? "#343434" : "#dcdcdc"};
                                            }
                                        `)}
                                    >
                                        <h3 style={{ margin: 5, marginBottom: 0, fontWeight: "bold" }}>
                                            <Folder size={26} color="#54aeff" fill="#54aeff" style={{ position: "relative", bottom: 2 }} />
                                            &nbsp;&nbsp;
                                            {this.state.list?.header}
                                        </h3>
                                        {
                                            this.state.list.description && (
                                                <>
                                                    <br />
                                                    <p style={{ color: this.state.dark ? "whitesmoke" : "#333", paddingLeft: 10, marginBottom: 0 }}>
                                                        {this.state.list.description}
                                                    </p>
                                                </>
                                            )
                                        }
                                        {/*
                                        <hr style={{ borderColor: this.state.dark ? "#343434" : "#dcdcdc" }}/>
                                        <div style={{ height: 20, fontFamily: "Jost" }}>
                                            <Link to={`/user/${this.state.list.user}`} className={cx(CStyles.flat_link)}>
                                                <span 
                                                    style={{ padding: 10, fontSize: "15pt", fontWeight: "bold" }} 
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
                                                            background: whitesmoke;
                                                            cursor: pointer;
                                                        }
                                                    `)}
                                                >
                                                    <span style={{ position: "relative", bottom: 2}}>
                                                        <Avatar
                                                            size={32}
                                                            name={this.state.list.user}
                                                            variant="marble"
                                                            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                                        />
                                                        &nbsp;&nbsp;
                                                    </span>
                                                    {this.state.list.user}
                                                </span>
                                            </Link>
                                        </div>
                                        */}
                                    </ListGroup.Item>
                                )
                            }
                            <br />
                            {
                                this.state.guides && this.state.guides.map(g => <TimelineCard guide={g} dark={this.state.dark} />)
                            }
                            <br />
                        </ListGroup>
                    </Col>
                    <Col md={4}>
                        <div style={{ position: "sticky", top: 25 }}>
                            <ProfileCard
                                user={this.state.user}
                                dark={this.state.dark}
                                localStorage={this.localStorage!}
                            />
                        </div>
                        <br />
                    </Col>
                </Row>
            </Template>
        )
    }

}