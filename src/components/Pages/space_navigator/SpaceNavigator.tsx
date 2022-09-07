import { cx, css } from "@emotion/css";
import { CognitoUser } from "amazon-cognito-identity-js";
import * as React from "react";
import { Col, Row } from "react-bootstrap";
import { Globe } from "react-feather";
import { BounceLoader } from "react-spinners";
import { Footnote } from "../../common/footnote";
import LocationCard from "../../common/location_card";
import PageBP from "../../common/PageBP/PageBP";
import Template from "../../common/template";
import UserHandler from "../../common/UserHandler";
import CStyles from "../../common/common_styles";
import config from "../../../config";

type Space = { id: string, name: string, url: string };

type Props = {};
type State = {
    dark: boolean,
    user: CognitoUser | null,
    spaces: Space[],
    hasLoaded: boolean
};

const Styles = {
    light_s: css`
        background: white;
        border-color: #dcdcdc !important;
        color: #333;
    `,
    dark_s: css`
        background: #161616;
        border-color: #343434 !important;
        color: whitesmoke;
    `
};

export default class SpaceNavigator extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: this.localStorage!.getItem("darkmode") === "true",
            user: (new UserHandler()).getUser(),
            spaces: [],
            hasLoaded: false
        };

    }

    init() {
        fetch(config.endpoints.getSpaces)
            .then(res => res.json())
            .then((data: Space[]) => {
                this.setState({ spaces: data, hasLoaded: true });
                data.forEach(x => console.log(x.url));
                console.log(window.origin);
            });
    }

    render() {
        return (
            <Template dark={this.state.dark} user={this.state.user} setDarkMode={this.setDarkMode} localStorage={this.localStorage!}>
                <Row>
                    <Col>
                        <LocationCard dark={this.state.dark}>
                            <Globe size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Space Navigator</strong>
                        </LocationCard>
                        <br />
                        <div
                            className={cx(this.state.dark ? Styles.dark_s : Styles.light_s)}
                            style={{
                                padding: 20,
                                border: "3px solid",
                                borderRadius: ".35rem",
                                fontFamily: "Jost"
                            }}
                            hidden
                        >

                        </div>
                        {
                            this.state.hasLoaded ? (
                                <>
                                    <div
                                        className={cx(this.state.dark ? Styles.dark_s : Styles.light_s)}
                                        style={{
                                            padding: 20,
                                            border: "3px solid",
                                            borderRadius: ".55rem",
                                            fontFamily: "Jost"
                                        }}
                                    >
                                        <div
                                            className={cx("text-center list-group-item-primary",
                                                (this.state.dark && css`
                                                    background: #343434;
                                                    color: whitesmoke;
                                                `)
                                            )}
                                            style={{ borderRadius: ".35rem", padding: 20, fontFamily: "Jost", marginBottom: 15 }}
                                        >
                                            You are at <strong>The Global Namespace</strong>. Use the Directory below to explore {this.state.spaces.length} public namespace{this.state.spaces.length !== 1 && "s"}.
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                gap: 10
                                            }}
                                        >
                                            {
                                                this.state.spaces.map(x => (
                                                    <a
                                                        href={x.url}
                                                        className={cx(CStyles.flat_link)}
                                                        style={{
                                                            display: "inline-flex",
                                                            color: this.state.dark ? "whitesmoke" : "#333"
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                borderRadius: ".35rem",
                                                                padding: "8px 12px",
                                                                border: "1px solid",
                                                                borderColor: this.state.dark ? "#343434" : "#dcdcdc"
                                                            }}
                                                            className={cx(window.origin === x.url ? css`
                                                                background: ${this.state.dark ? "#343434" : "#dcdcdc"};
                                                            ` : css`
                                                                &:hover {
                                                                    background: ${this.state.dark ? "#343434" : "#dcdcdc"};
                                                                }
                                                            `)}
                                                        >
                                                            {x.name}
                                                        </div>
                                                    </a>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <Footnote dark={this.state.dark} />
                                </>
                            ) : (
                                <>
                                    <br />
                                    <div style={{ height: 50, width: 50, marginTop: 50, marginBottom: 30, display: "table", marginLeft: "auto", marginRight: "auto" }}>
                                        <BounceLoader loading={true} color="#666" size={100} />
                                    </div>
                                    <br />
                                </>
                            )
                        }
                    </Col>
                </Row>
            </Template>
        )
    }

}