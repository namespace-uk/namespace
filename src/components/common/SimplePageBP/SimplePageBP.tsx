import React from "react";
import { Col, Row } from "react-bootstrap";

import { Redirect } from "react-router-dom";
import PageBP, { BPState } from "../PageBP/PageBP";
import Template from "../template";

type Props = {
    header: string,
    updated?: Date,
    children?: React.ReactNode
};
type State = BPState;

export default class SimplePageBP extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: false,
            user: null
        };
    }

    init() { }

    render() {
        if (!this.props.header) return (<Redirect to="/" />)

        return (
            <Template dark={this.state.dark} isBlank={true} localStorage={this.localStorage!}>
                <br /><br />
                <Row>
                    <Col md={2} />
                    <Col md={8}>
                        <div style={{ fontFamily: "Jost", background: "white", border: "1px solid #dcdcdc", borderRadius: ".35rem", padding: 40 }}>
                            <h1 style={{ fontWeight: "bold", color: "black" }}>{this.props.header}</h1>
                            <h6 style={{ color: "gray" }}>
                                Last Updated: {this.props.updated?.toDateString()}
                            </h6>
                            <hr />
                            <div style={{ color: "#333", lineHeight: 1.4 }}>
                                {this.props.children}
                            </div>
                        </div>
                    </Col>
                    <Col md={2} />
                </Row>
            </Template>
        )
    }

}