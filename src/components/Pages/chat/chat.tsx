import React from "react";

import Template from "../../common/template";
import LocationCard from "../../common/location_card";
import { Row, Col } from "react-bootstrap";
import { MessageSquare } from "react-feather";
import PageBP, { BPState } from "../../common/PageBP/PageBP";

type Props = {

};
type State = BPState;

export default class Chat extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: false,
            user: null
        }
    }

    init() { }

    render() {
        return (
            <Template dark={this.state.dark} localStorage={this.localStorage!}>
                <Row>
                    <Col style={{ paddingLeft: 40, paddingRight: 40 }}>
                        <LocationCard dark={this.state.dark}>
                            <MessageSquare size={14} style={{ marginBottom: 3 }} />&nbsp;
                            <strong>Chat</strong>
                        </LocationCard>
                    </Col>
                </Row>
                <br />
            </Template>
        )
    }

}