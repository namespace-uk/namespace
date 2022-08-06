import React from "react";

import { css, cx } from "@emotion/css";
import { Container } from "react-bootstrap";

import NsNavbar from "./nsnavbar";
import NsNavbarBlank from "./nsnavbar_blank";
import { CognitoUser } from "amazon-cognito-identity-js";

type State = {};
type Props = {
    dark: boolean,
    isBlank?: boolean,
    user: CognitoUser | null,
    setDarkMode: (x: boolean) => void,
    localStorage: Storage,
    defaultSearchValue?: string,
    children?: React.ReactNode
};

export default class Template extends React.Component<Props, State> {

    static defaultProps = {
        dark: false,
        user: null,
        setDarkMode: () => { }
    }

    render() {
        return (
            <div
                style={{ background: (this.props.dark ? "black" : "#f6f8fa"), minHeight: "100vh" }}
                className={cx(css`
                    & {
                        --fg-dark: #1A1A1B;
                        --fg-light: white;
                    
                        --bg-dark: black;
                        --bg-light: #f6f8fa;    
                    
                        --border-dark: #444;
                        --border-light: #dcdcdc;
                    
                        --color-dark: whitesmoke;
                        --color-light: #333;
                    
                        --radius-lrg: .7rem;
                        --radius-md: .35rem;
                    }
                `)}
            >
                {
                    this.props.isBlank ?
                        <NsNavbarBlank dark={this.props.dark} />
                        : <NsNavbar user={this.props.user} dark={this.props.dark} setDarkMode={this.props.setDarkMode} defaultSearchValue={this.props.defaultSearchValue} localStorage={this.props.localStorage} />
                }
                <br />
                <Container
                    style={{ height: "calc(100vh - 200px)", display: "table" }}
                    className={cx(css`
                        @media (max-width: 992px) {
                            min-width: calc(100vw - 30px) !important;
                        }
                        @media (min-width: 992px) {
                            padding-left: 55px;
                            padding-right: 55px;
                        }
                    `)}
                >
                    {this.props.children}
                </Container>
                <br /><br />
            </div>
        )
    }
}