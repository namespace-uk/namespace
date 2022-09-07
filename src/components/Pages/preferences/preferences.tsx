import React from "react";

import { css, cx } from "@emotion/css";
import { MoreVertical, Settings, Tool } from "react-feather";
import Template from "../../common/template";
import { Row, Col, Button, Form } from "react-bootstrap";
import LocationCard from "../../common/location_card";
import PageBP, { BPState } from "../../common/PageBP/PageBP";
import UserHandler from "../../common/UserHandler";
import { Redirect } from "react-router-dom";
import config from "../../../config";
import CommonType from "../../common/types";
import { CognitoUserPool } from "amazon-cognito-identity-js";

type Props = {};
type State = BPState & {
    redirectTo: string | null,
    profile: CommonType.ProfileData | null,
    loadingState: LoadingState,
    page: Page
};

export enum LoadingState {
    IDLE,
    LOADING,
    DONE,
    FAILED
}

enum Page {
    ACCOUNT,
    OTHER
}

export default class Preferences extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        const user = (new UserHandler()).getUser();

        this.state = {
            dark: this.localStorage!.getItem("darkmode") === "true",
            user: user,
            redirectTo: user ? null : "/",
            profile: null,
            loadingState: LoadingState.LOADING,
            page: Page.ACCOUNT
        };

        const userPool = new CognitoUserPool(config.cognito_pool_data);
        const up = userPool.getCurrentUser();
        up?.getSession((err: any, session: any) => {
            if (err) {
                console.log(err);
            } else {
                up.getUserAttributes((er, se) => {
                    if (er) console.log(er);
                    else console.log(se);
                });
            }
        });
    }

    init() { }

    getProfile = () => {
        if (!this.state.user) return;

        fetch(config.endpoints.getProfile, {
            method: "POST",
            body: JSON.stringify({
                username: this.state.user.getUsername(),
                failThrough: true
            })
        }).then(res => {
            if (res.status !== 200) return Promise.reject(res);
            return res.json();
        })
            .then(data => {
                data = data.body;
                this.setState({
                    profile: data.user,
                    // guides: data.guides,
                    // likes: data.guides.map((x: CommonType.Guide) => x.likes || 0).reduce((x: number, y: number) => x + y, 0),
                    loadingState: LoadingState.DONE,
                });
            })
            .catch(err => {
                this.setState({ loadingState: LoadingState.FAILED });
                console.log("An error occured!");
                return null;
            });
    }

    render() {
        if (this.state.redirectTo)
            return <Redirect to={this.state.redirectTo} />;

        const divStyle = {
            borderRadius: ".45rem",
            // padding: 30,
            border: "2px solid",
            background: this.state.dark ? "#161616" : "white",
            borderColor: this.state.dark ? "#343434" : "#dcdcdc",
            color: this.state.dark ? "whitesmoke" : "#333",
            fontFamily: "Jost, sans-serif"
        };

        return (
            <Template
                dark={this.state.dark}
                localStorage={this.localStorage!}
                setDarkMode={this.setDarkMode}
                user={this.state.user}
            >
                {/**<WelcomeCard/>*/}
                <Row>
                    <Col md={12}>
                        <LocationCard dark={this.state.dark}>
                            <Tool size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Preferences</strong>
                        </LocationCard>
                    </Col>
                </Row>
                <div style={{ height: 25 }} />
                <Row>
                    <Col md={4}>
                        {
                            [
                                [
                                    (<Settings size={16} style={{ position: "relative", bottom: 1.5 }} />),
                                    "Account",
                                    Page.ACCOUNT
                                ],
                                [
                                    (<MoreVertical size={16} style={{ position: "relative", bottom: 1.5 }} />),
                                    "Other",
                                    Page.OTHER
                                ]
                            ].map(([x, y, z]) => (
                                <div
                                    key={y as string}
                                    style={{
                                        fontFamily: "Jost",
                                        color: this.state.dark ? "whitesmoke" : "#333",
                                        padding: "9px 4px 9px 11px",
                                        border: "1px solid",
                                        borderRadius: ".35rem",
                                        marginBottom: 5
                                    }}
                                    className={cx(this.state.dark ? css`
                                        background: ${this.state.page === z ? "rgba(30, 58, 138, .6)" : "inherit"};
                                        border-color: ${this.state.page === z ? "rgba(30, 58, 138, .6)" : "black"} !important;
                                        ${this.state.page === z && "& > span > svg { stroke: #2563eb !important; }"}
                                    ` : css`
                                        background: ${this.state.page === z ? "rgb(37 99 235/.15)" : "inherit"};
                                        ${this.state.page === z && "color: #1d4ed8 !important;"}
                                        border-color: ${this.state.page === z ? "rgb(37 99 235/.15)" : "rgb(246, 248, 250)"} !important;
                                    `, css`
                                        &:hover {
                                            cursor: pointer;
                                            border-color: ${this.state.dark ? "#343434" : "#dcdcdc"} !important;
                                        }
                                    `)}
                                    onClick={() => this.setState({ page: z as Page })}
                                >
                                    <span>{x}</span>
                                    &nbsp;&nbsp;
                                    {y}
                                </div>
                            ))
                        }
                        <br />
                    </Col>
                    <Col md={8}>
                        {
                            (() => {
                                switch (this.state.page) {
                                    case Page.ACCOUNT: return (
                                        <>
                                            <div style={divStyle}>
                                                <div style={{ padding: 30 }}>
                                                    <h3 style={{ fontWeight: "bold", margin: 0 }}>Account</h3>
                                                </div>
                                                <hr style={{ borderColor: this.state.dark ? "#343434" : "#dcdcdc" }} hidden />
                                                <div style={{ padding: 30, borderTop: "1px solid", borderColor: this.state.dark ? "#444" : "#dcdcdc" }}>
                                                    <Form>
                                                        <Form.Group
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                gap: 20, alignItems: "center"
                                                            }}
                                                        >
                                                            <Form.Label style={{ flex: 3 }}>
                                                                <h6>Username</h6>
                                                                <p style={{ fontSize: "10pt", color: "#999", marginBottom: 0 }}>
                                                                    This is how you appear to other Namespace users.
                                                                </p>
                                                            </Form.Label>
                                                            <Form.Control
                                                                defaultValue="fermicide"
                                                                style={{
                                                                    flex: 2,
                                                                    background: this.state.dark ? "black" : "whitesmoke",
                                                                    borderColor: this.state.dark ? "#444" : "#dcdcdc",
                                                                    color: this.state.dark ? "whitesmoke" : "#333"
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Form>
                                                </div>
                                                <div style={{ padding: 30, borderTop: "1px solid", borderColor: this.state.dark ? "#444" : "#dcdcdc" }}>
                                                    <Form>
                                                        <Form.Group
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                gap: 20, alignItems: "center"
                                                            }}
                                                        >
                                                            <Form.Label style={{ flex: 3 }}>
                                                                <h6>Email</h6>
                                                                <p style={{ fontSize: "10pt", color: "#999", marginBottom: 0 }}>
                                                                    This is your fucking email. What the hell else would you think it is.
                                                                </p>
                                                            </Form.Label>
                                                            <Form.Control
                                                                defaultValue="Nothing"
                                                                style={{
                                                                    flex: 2,
                                                                    background: this.state.dark ? "black" : "whitesmoke",
                                                                    borderColor: this.state.dark ? "#444" : "#dcdcdc",
                                                                    color: this.state.dark ? "whitesmoke" : "#333"
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Form>
                                                </div>
                                            </div>
                                            <br />
                                            <div
                                                style={{
                                                    ...divStyle, ...{
                                                        borderColor: "rgba(220, 53, 69, 0.8)",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "baseline",
                                                        padding: "15px 20px"
                                                    }
                                                }}
                                            >
                                                <h6 style={{ margin: 0, display: "inline-block", color: this.state.dark ? "whitesmoke" : "#333" }}>Delete your Account</h6>
                                                <Button
                                                    style={{
                                                        float: "right",
                                                        borderWidth: 2,
                                                        borderRadius: ".35rem"
                                                    }}
                                                    variant="danger" size="sm"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </>
                                    )
                                }
                            })()
                        }
                    </Col>
                </Row>
            </Template>
        )
    }
}