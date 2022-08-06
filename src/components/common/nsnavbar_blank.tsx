import React from "react";
import { Link } from "react-router-dom";

import { css, cx } from "@emotion/css";
import config from "../../config";

type Props = {
    dark: boolean
};
type State = {};

const Styles = {
    header_s: css`
        height: 61px;
        border-bottom: 1px solid #dcdcdc;
    `,
    logo_s: css`
        color: black;
        
        &:hover {
            text-decoration: none;
            color: rgba(0, 0, 0, 0.7);
        }
    `
}

export default class NsNavbarBlank extends React.Component<Props, State> {

    render() {
        return (
            <div style={{ background: (this.props.dark ? "#2f363d" : "white") }}>
                <header className={cx(Styles.header_s)}>
                    <div style={{ display: "inline-block", position: "absolute", height: 40, top: 2, padding: "8px 15px" }}>
                        <Link to="/" className={cx(Styles.logo_s)}>
                            <img
                                alt="Logo"
                                src="/assets/img/svg/logo.svg"
                                height={39} width={39}
                                style={{
                                    borderRadius: ".25rem",
                                    marginBottom: 8, padding: 5
                                }}
                            />
                            &nbsp;
                            <span style={{ fontFamily: "Jost, sans-serif", fontSize: "17pt", fontWeight: "bold" }}>
                                Namespace
                                <sup style={{ color: "#666" }}><small>{config.version}</small></sup>
                            </span>
                        </Link>
                    </div>
                </header>
            </div>
        )
    }
}