import React from "react";
import { Row } from "react-bootstrap";

import { css, cx } from "@emotion/css";
import { Slash } from "react-feather";
import Template from "../common/template";
import LocationCard from "../common/location_card";
import { Link } from "react-router-dom";
import PageBP, { BPState, withParams } from "../common/PageBP/PageBP";

const Styles = {
    small_row_width: css`
        width: 100%;
        max-width: 450px;
        display: table;
        margin-left: auto;
        margin-right: auto;
    `
}

type Props = {};
type State = BPState;

class UnknownRoutePage extends PageBP<Props, State> {

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
            <Template dark={this.state.dark} isBlank={true} localStorage={this.localStorage!}>
                <br /><br />
                <Row className={cx(Styles.small_row_width)} style={{ marginBottom: 15 }}>
                    <LocationCard dark={this.state.dark}>
                        <Slash size={14} style={{ marginBottom: 3 }} />&nbsp;
                        <strong>Page not Found </strong>
                    </LocationCard>
                </Row>
                <Row className={cx(Styles.small_row_width)}>
                    <div style={{ textAlign: "center", fontFamily: "Jost", background: "white", border: "1px solid #dcdcdc", borderRadius: ".35rem", padding: 30 }}>
                        <Link to="/">
                            Return to Home
                        </Link>
                    </div>
                </Row>
            </Template>
        )
    }

}

export default withParams(UnknownRoutePage);