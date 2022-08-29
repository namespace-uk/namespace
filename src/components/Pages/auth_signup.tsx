import React from "react";
import { Link, Redirect } from "react-router-dom";

import { css, cx } from "@emotion/css";
import Template from "../common/template";
import { Button, Form, Row } from "react-bootstrap";
import LocationCard from "../common/location_card";
import { AlertTriangle, CheckCircle, LogIn, UserPlus } from "react-feather";
import BounceLoader from "react-spinners/BounceLoader";

import $ from "jquery";
import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from "amazon-cognito-identity-js";
import config from "../../config";
import PageBP from "../common/PageBP/PageBP";

const Styles = {
    signup_box_s: css`
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

type Props = {};
type State = {
    dark: boolean,
    userDetails: any
    page: number,
    user: CognitoUser | null,
    redirectToLogin: boolean
};

export default class SignupPage extends PageBP<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: false,
            userDetails: null,
            page: 1,
            user: null,
            redirectToLogin: false
        };

        // Method Bindings
        this.submit_auth_group_1 = this.submit_auth_group_1.bind(this);
        this.submit_auth_group_2 = this.submit_auth_group_2.bind(this);
        this.submit_confirmation = this.submit_confirmation.bind(this);
        this.validate_email = this.validate_email.bind(this);
        this.validate_password = this.validate_password.bind(this);
        this.usernameIsValid = this.usernameIsValid.bind(this);
        this.clear_username_field = this.clear_username_field.bind(this);
    }

    init() { }

    clear = (s: string[]) => s.forEach(x => $(x).val(""));

    submit_auth_group_1(e: React.FormEvent) {
        e.preventDefault();

        // Submit Auth Info
        const email_address: string = $("#email_address_field").val() as string;
        const password: string = $("#password_field").val() as string;

        // Check Validity
        if (!this.validate_email(email_address) || !this.validate_password(password)) {
            $("#validity_error_msg").prop("hidden", false); // Error message
            this.clear(["#email_address_field", "#password_field"])
            return;
        };

        const userDetails = {
            email: email_address,
            password: password
        }
        this.setState({ userDetails: userDetails, page: 2 });
    }

    clear_username_field() {
        this.clear(["#username_field"]);
    }

    submit_auth_group_2(e: React.FormEvent) {
        e.preventDefault();
        this.setState({ page: 3 });

        const username: string = $("#username_field").val() as string;
        this.clear_username_field();

        // Check Validity
        if (!this.usernameIsValid(username)) {
            // Display error message if invalid
            $("#username_err_msg").prop("hidden", false);
            return;
        }
        // Set state if valid
        const userDetails = this.state.userDetails;
        userDetails.username = username;

        // Create account
        const userPool = new CognitoUserPool(config.cognito_pool_data);
        userPool.signUp(
            userDetails.username,
            userDetails.password,
            [
                new CognitoUserAttribute({
                    Name: "email",
                    Value: userDetails.email
                })
            ],
            [], (err, res) => {
                if (err) {
                    alert(err.message || JSON.stringify(err));
                } else if (res) {
                    this.setState({ userDetails: userDetails, page: 4, user: res.user });
                }
            }
        );
    }

    submit_confirmation(e: React.FormEvent) {
        e.preventDefault();

        const confirm_code: string = $("#cc_field").val() as string;
        if (!this.state.user) return;

        this.state.user.confirmRegistration(confirm_code, false, async (err, res) => {
            if (!res) return;
            await fetch(config.endpoints.confirmUser, {
                method: "POST",
                body: JSON.stringify({
                    username: this.state.user?.getUsername()
                })
            });
            this.setState({ redirectToLogin: true });
        });
    }

    validate_email(email: string): boolean {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    validate_password(password: string): boolean {
        return password.replace(/\s/g, '').length > 7;
    }

    usernameIsValid(username: string): boolean {
        return !!username;
    }

    render() {
        if (this.state.redirectToLogin) return (<Redirect to="/auth/login" />)

        return (
            <Template dark={false} localStorage={this.localStorage!} isBlank>
                <br /><br />
                <Row className={cx(Styles.small_row_width)} style={{ marginBottom: 15 }}>
                    <LocationCard dark={this.state.dark}>
                        <UserPlus size={14} style={{ marginBottom: 3 }} />&nbsp;
                        <strong>Sign Up</strong>
                    </LocationCard>
                </Row>
                <Row className={cx(Styles.small_row_width)}>
                    <div className={cx(Styles.signup_box_s)}>
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
                                    case 1: return (
                                        <Form onSubmit={this.submit_auth_group_1} className={cx(css`.form-control { margin-bottom: 16px; }`)}>
                                            <Form.Group>
                                                <Form.Label style={{ color: "#333" }}>Email Address</Form.Label>
                                                <Form.Control id="email_address_field" type="email" />
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label style={{ color: "#333" }}>Password (8 or more characters)</Form.Label>
                                                <Form.Control id="password_field" type="password" />
                                            </Form.Group>
                                            <p>
                                                <small style={{ color: "#666" }}>By clicking "Agree &amp; Join" you agree to the <Link to="/terms-of-service">Namespace Terms of Use</Link>, <Link to="/privacy-policy">Privacy Policy</Link>, and <Link to="/cookie-policy">Cookie Policy</Link></small>
                                            </p>
                                            <div id="validity_error_msg" style={{ borderRadius: ".35rem", padding: 15, lineHeight: "1.2" }} className="list-group-item-danger" hidden>
                                                <AlertTriangle style={{ position: "relative", marginBottom: 2, marginRight: 2 }} size={13} />
                                                &nbsp;
                                                <small>Check that the email and password you have entered are valid.</small>
                                            </div>
                                            <Button type="submit" variant="primary" size="lg" style={{ width: "100%", fontSize: "1.2rem", fontFamily: "Jost", marginTop: 10 }}>
                                                Agree & Join
                                            </Button>
                                        </Form>
                                    )
                                    case 2: return (
                                        <Form onSubmit={this.submit_auth_group_2} className={cx(css`.form-control { margin-bottom: 16px; }`)}>
                                            <Form.Group>
                                                <Form.Label style={{ color: "#333", marginBottom: 0 }}>
                                                    Username
                                                </Form.Label>
                                                <br />
                                                <Form.Label style={{ color: "#666" }}>
                                                    <small>
                                                        This is the name other users will see on Namespace!
                                                    </small>
                                                </Form.Label>
                                                <Form.Control id="username_field" type="username" />
                                            </Form.Group>
                                            <div id="username_err_msg" style={{ borderRadius: ".35rem", padding: 15, lineHeight: "1.2" }} className="list-group-item-danger" hidden>
                                                <AlertTriangle style={{ position: "relative", marginBottom: 2, marginRight: 2 }} size={13} />
                                                &nbsp;
                                                <small>Please enter a Username</small>
                                            </div>
                                            <Button variant="primary" size="lg" style={{ width: "100%", fontSize: "1.2rem", fontFamily: "Jost", marginTop: 10 }} type="submit">
                                                Continue
                                            </Button>
                                        </Form>
                                    )
                                    case 3: return (
                                        <>
                                            <div style={{ height: 100, width: 100, marginTop: 50, marginBottom: 30, display: "table", marginLeft: "auto", marginRight: "auto" }}>
                                                <BounceLoader loading={true} color="#666" size={100} />
                                            </div>
                                        </>
                                    )
                                    case 4: return (
                                        <>
                                            <div style={{ borderRadius: ".35rem", padding: 15, lineHeight: "1.2" }} className="list-group-item-success">
                                                <CheckCircle style={{ position: "relative", marginBottom: 2, marginRight: 2 }} size={13} />
                                                &nbsp;
                                                <small>Account Created! Check your email for a confirmation code.</small>
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
                                                <Button variant="primary" size="lg" style={{ width: "100%", fontSize: "1.2rem", fontFamily: "Jost", marginTop: 10 }} type="submit">
                                                    Confirm
                                                </Button>
                                            </Form>
                                        </>
                                    )
                                }
                            })()
                        }
                        {
                            this.state.page === 1 && (
                                <Link to="/auth/login">
                                    <Button
                                        id="login_instead_btn"
                                        variant="light" size="sm"
                                        style={{ fontFamily: "Jost", width: "100%", marginTop: 10 }}
                                        className={PageBP.Styles.button(false)}
                                    >
                                        <LogIn size={12} />&nbsp;
                                        Login Instead?
                                    </Button>
                                </Link>
                            )
                        }
                    </div>
                </Row>
            </Template>
        )
    }
}
