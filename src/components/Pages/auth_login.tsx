import React from "react";

import { css, cx } from "@emotion/css";
import Template from "../common/template";
import { Button, Form, Row } from "react-bootstrap";
import LocationCard from "../common/location_card";
import { AlertCircle, AlertTriangle, LogIn, UserPlus } from "react-feather";
import { Link, Redirect } from "react-router-dom";

import $ from "jquery";
import BounceLoader from "react-spinners/BounceLoader";

import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import UserHandler from "../common/UserHandler";
import config from "../../config";
import PageBP, { BPState } from "../common/PageBP/PageBP";

const Styles = {
    login_box_s: css`
        background: white;
        border-radius: .35rem;
        padding: 30px;
        border: 1px solid #dcdcdc;
        font-family: Jost, sans-serif;
    `,
    small_row_width: css`
        width: 100%;
        max-width: 450px;
        display: table;
        margin-left: auto;
        margin-right: auto;
    `
};

enum Page {
    LOGIN_PAGE,
    CONFIRM_PAGE
}

type Props = {};
type State = BPState & {
    redirectToHome: boolean,
    page: Page,
    userToConfirm: CognitoUser | null
};

export default class LoginPage extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: false,
            user: (new UserHandler()).getUser(),
            redirectToHome: false,
            userToConfirm: null,
            page: Page.LOGIN_PAGE
        };

        // Method Bindings
        this.submit_login_form = this.submit_login_form.bind(this);
        this.hide_errors = this.hide_errors.bind(this);
    }

    init() { }

    clear_fields() {
        $("#email_field").val("");
        $("#passwd_field").val("");
    }

    enable_fields() {
        ["#email_field", "#passwd_field"].map(
            x => $(x).prop("disabled", false)
        );
    }

    hide_errors() {
        ["#correctness_error_msg", "#validity_error_msg"].map(
            x => $(x).prop("hidden", true)
        );
    }

    submit_login_form = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        this.hide_errors();

        const email: string = $("#email_field").val() as string;
        const passwd: string = $("#passwd_field").val() as string;

        $("#validity_error_msg").prop("hidden", true);
        $("#login_submit_btn").prop("hidden", true);
        $("#signup_link_btn").prop("hidden", true);
        $("#auth_pending").prop("hidden", false);
        // Disable forms
        $("#email_field").prop("disabled", true);
        $("#passwd_field").prop("disabled", true);

        const userPool = new CognitoUserPool(config.cognito_pool_data);
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });

        const authDetails = new AuthenticationDetails({
            Username: email,
            Password: passwd,
        });
        cognitoUser.authenticateUser(authDetails, {
            onSuccess: (res) => {
                this.setState({ redirectToHome: true });
            },
            onFailure: (err: Error) => {
                // this.clear_fields();
                if (err.name === "UserNotConfirmedException") {
                    this.setState({
                        page: Page.CONFIRM_PAGE,
                        userToConfirm: cognitoUser
                    });
                    cognitoUser.resendConfirmationCode(() => { });
                } else {
                    $("#correctness_error_msg").prop("hidden", false);
                    this.enable_fields();
                }
                $("#auth_pending").prop("hidden", true);
                $("#login_submit_btn").prop("hidden", false);
                $("#signup_link_btn").prop("hidden", false);
                $("#passwd_field").trigger("select");
            }
        });
    }

    submit_confirmation = (e: React.FormEvent) => {
        e.preventDefault();

        const confirm_code: string = $("#cc_field").val() as string;
        if (!this.state.userToConfirm) return;

        this.state.userToConfirm.confirmRegistration(confirm_code, false, async (err, res) => {
            if (!res) return;
            await fetch(config.endpoints.confirmUser, {
                method: "POST",
                body: JSON.stringify({
                    username: this.state.userToConfirm!.getUsername()
                })
            });
            this.submit_login_form();
        });
    }

    /*validate_email(email: string) : boolean {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }*/

    render() {
        if (!!this.state.user || this.state.redirectToHome) return (<Redirect to="/" />);

        return (
            <Template dark={false} localStorage={this.localStorage!} isBlank>
                <br /><br />
                <Row className={cx(Styles.small_row_width)} style={{ marginBottom: 15 }}>
                    <LocationCard dark={this.state.dark}>
                        <LogIn size={14} style={{ marginBottom: 3 }} />&nbsp;
                        <strong>Login</strong>
                    </LocationCard>
                </Row>
                <Row className={cx(Styles.small_row_width)}>
                    <div className={cx(Styles.login_box_s)}>
                        <div>
                            <img
                                alt="Namespace Logo"
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
                        </div>
                        &nbsp;&nbsp;<span style={{ color: "#333" }}>The Online Learning Community</span>
                        <hr />
                        {
                            (() => {
                                switch (this.state.page) {
                                    case Page.LOGIN_PAGE:
                                        return (
                                            <>
                                                <Form onSubmit={this.submit_login_form} className={cx(css`.form-control { margin-bottom: 16px; }`)}>
                                                    <Form.Group>
                                                        <Form.Label style={{ color: "#333" }}>Username or Email Address</Form.Label>
                                                        <Form.Control id="email_field" type="username" onKeyDown={this.hide_errors} />
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Label style={{ color: "#333" }}>Password</Form.Label>
                                                        <Form.Control id="passwd_field" type="password" onKeyDown={this.hide_errors} />
                                                    </Form.Group>
                                                    <div id="validity_error_msg" style={{ borderRadius: ".35rem", padding: 15, lineHeight: "1.2" }} className="list-group-item-danger" hidden>
                                                        <AlertTriangle style={{ position: "relative", marginBottom: 2, marginRight: 2 }} size={13} />
                                                        &nbsp;
                                                        <small>Please enter a valid email and password.</small>
                                                    </div>
                                                    <div id="correctness_error_msg" style={{ borderRadius: ".35rem", padding: 15, lineHeight: "1.2" }} className="list-group-item-danger" hidden>
                                                        <AlertTriangle style={{ position: "relative", marginBottom: 2, marginRight: 2 }} size={13} />
                                                        &nbsp;
                                                        <small>The email and password combination you have entered was not found on our servers.</small>
                                                    </div>
                                                    <Button id="login_submit_btn" variant="primary" size="lg" style={{ width: "100%", fontSize: "1.2rem", fontFamily: "Jost", marginTop: 10 }} type="submit">
                                                        Log In
                                                    </Button>
                                                    <Link to="/auth/signup">
                                                        <Button
                                                            id="signup_link_btn"
                                                            variant="light" size="sm"
                                                            style={{ fontFamily: "Jost", width: "100%", marginTop: 10 }}
                                                            className={PageBP.Styles.button(false)}
                                                        >
                                                            <UserPlus size={12} />&nbsp;
                                                            Need an Account?
                                                        </Button>
                                                    </Link>
                                                    <div id="auth_pending" hidden>
                                                        <div style={{ height: 50, width: 50, marginTop: 50, marginBottom: 30, display: "table", marginLeft: "auto", marginRight: "auto" }}>
                                                            <BounceLoader loading={true} color="#666" size={50} />
                                                        </div>
                                                    </div>
                                                </Form>
                                            </>
                                        )
                                    case Page.CONFIRM_PAGE:
                                        return (
                                            <>
                                                <div style={{ borderRadius: ".35rem", padding: 15, lineHeight: "1.2" }} className="list-group-item-primary">
                                                    <AlertCircle style={{ position: "relative", marginBottom: 2, marginRight: 2 }} size={13} />
                                                    &nbsp;
                                                    <small>Check your email for a confirmation code.</small>
                                                </div>
                                                <br />
                                                <Form onSubmit={this.submit_confirmation} className={cx(css`.form-control { margin-bottom: 16px; }`)}>
                                                    <Form.Group>
                                                        <Form.Label style={{ color: "#333" }}>
                                                            Confirmation Code
                                                        </Form.Label>
                                                        <br />
                                                        <Form.Control id="cc_field" placeholder="XXXXXX" />
                                                    </Form.Group>
                                                    <Button
                                                        variant="primary"
                                                        size="lg" type="submit"
                                                        style={{
                                                            width: "100%",
                                                            fontSize: "1.2rem",
                                                            fontFamily: "Jost",
                                                            marginTop: 10
                                                        }}
                                                        onClick={() => { console.log("Done"); }}
                                                    >
                                                        Confirm
                                                    </Button>
                                                </Form>
                                            </>
                                        )
                                }
                            })()
                        }
                    </div>
                </Row>
            </Template>
        )
    }
}
