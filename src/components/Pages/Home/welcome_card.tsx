import React from "react";
import { Link } from "react-router-dom";

import { css, cx } from "@emotion/css";
import {Button} from "react-bootstrap";

const Styles = {
    card_s: css`
      border: 1px solid #dcdcdc;
      border-bottom-color: #c4c4c4;
      border-radius: .5rem;
      background: white;
      padding: 50px;
      width: 500px;
      display: table;
      margin-left: auto;
      margin-right: auto;
      font-family: Jost, sans-serif;
    `
}

type Props = {};
type State = {};

export default class WelcomeCard extends React.Component<Props, State> {

    render() {
        return (
            <div style={{ display: "table-cell", verticalAlign: "middle" }}>
                <div className={cx( Styles.card_s )}>
                    <img src="\assets\img\svg\logo.svg" style={{ display: "table", marginLeft: "auto", marginRight: "auto" }} width={80}/>
                    <br/>
                    <h4 style={{ textAlign: "center", fontWeight: "bold" }}>Namespace</h4>
                    <h6 style={{ textAlign: "center", color: "#666" }}>The Online Learning Community</h6>
                    <br/>
                    <hr/>
                    <Link to="/login">
                        <Button style={{ borderRadius: ".75rem", width: "100%", padding: 10, fontSize: "1rem" }}>
                            Log In
                        </Button>
                    </Link>
                    <br/><br/>
                    <Link to="/register">
                        <Button style={{ borderRadius: ".75rem", width: "100%", padding: 10, fontSize: "1rem", background: "white", border: "2px solid #ededed", color: "#666" }}>
                            Create an Account
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

}