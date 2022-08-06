import React from "react";

import { cx } from "@emotion/css";
import CStyles from "../../common/common_styles";
import { Tool } from "react-feather";
import Template from "../../common/template";
import { Row, Col } from "react-bootstrap";
import LocationCard from "../../common/location_card";
import ProfileCard from "../../common/profile_card/profile_card";
import PageBP, { BPState } from "../../common/PageBP/PageBP";

type Props = {};
type State = BPState;

export default class Preferences extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: false,
            user: null
        };
    }

    init() { }

    render() {
        return (
            <Template dark={this.state.dark} localStorage={this.localStorage!}>
                {/**<WelcomeCard/>*/}
                <Row>
                    <Col md={8} sm={12} style={{ paddingLeft: 40 }}>
                        <LocationCard dark={this.state.dark}>
                            <Tool size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Preferences</strong>
                        </LocationCard>
                        <br />
                        <div style={{ background: "white", borderRadius: ".35rem", padding: 40, border: "1px solid #dcdcdc", fontFamily: "Jost, sans-serif" }}>
                            <h3 style={{ fontWeight: "bold" }}>General</h3>
                        </div>
                    </Col>
                    <Col md={4} sm={0} className={cx(CStyles.small_col_s)} style={{ paddingRight: 40 }}>
                        <ProfileCard localStorage={this.localStorage!} principalOwnsProfile />
                        <br />
                        <div style={{ background: "var(--primary)", border: (this.state.dark ? "1px solid #818384" : "1px solid #dcdcdc"), width: "100%", height: 380, borderRadius: ".35rem" }}></div>
                    </Col>
                </Row>
            </Template>
        )
    }
}