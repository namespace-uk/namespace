import React from "react";
import { Col, Row, Container } from "react-bootstrap";
import { ChevronsRight } from "react-feather";
import LocationCard from "../../common/location_card";
import Template from "../../common/template";

import Styles from "./account_creation_page_styles";
import { cx } from "@emotion/css";

import $ from "jquery";
import PageBP, { BPState } from "../../common/PageBP/PageBP";

type Props = {};
type State = BPState;

export default class AccountCreationPage extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: false,
            user: null
        }
    }

    completeAvatarSlide() {
        $("#avatar_slide").hide();
        $("#profile_details_slide").prop("hidden", false);
    }

    init() { }

    render() {
        return (
            <Template dark={false} localStorage={this.localStorage!} isBlank>
                <Row>
                    <Col style={{ paddingLeft: 40, paddingRight: 40 }}>
                        <LocationCard dark={false}>
                            <ChevronsRight size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Account Creation</strong>
                        </LocationCard>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col style={{ paddingLeft: 40, paddingRight: 40 }}>
                        <div id="avatar_slide" className={cx(Styles.main_box_s)}>
                            <h2 className="text-center" style={{ fontWeight: "bold", marginTop: 10, color: "#333" }}>Profile Picture</h2>
                            <h6 className="text-center" style={{ color: "#666" }}>"Self-portraits are a way of revealing something about oneself" - Eric Kandel</h6>
                            <br />
                            <Container fluid>
                                <Row style={{ fontWeight: "bold" }}>
                                    <Col md={2} />
                                    <Col md={4} style={{ padding: 20 }}>
                                        <span onClick={() => { this.completeAvatarSlide(); }}>
                                        </span>
                                        <br />
                                        <h5 className="text-center" style={{ fontWeight: "normal" }}> Colorful Avatar </h5>
                                    </Col>
                                    <Col md={4} style={{ padding: 20 }}>
                                        <span onClick={() => { this.completeAvatarSlide(); }}>
                                        </span>
                                        <br />
                                        <h5 className="text-center" style={{ fontWeight: "normal" }}> Upload Custom Avatar </h5>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                        <div id="profile_details_slide" className={cx(Styles.main_box_s)} hidden>
                            <h2 className="text-center" style={{ fontWeight: "bold", marginTop: 10, color: "#333" }}>Customize Your Profile</h2>
                            <h6 className="text-center" style={{ color: "#666" }}>"The difference between something good and something great is attention to detail." - Charles R. Swindoll</h6>
                            <br />
                        </div>
                    </Col>
                </Row>
            </Template>
        )
    }

}