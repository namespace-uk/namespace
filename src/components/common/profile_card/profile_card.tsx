import React from "react";
import { Link } from "react-router-dom";

import { css, cx } from "@emotion/css";
import { Button, Form } from "react-bootstrap";
import Avatar from "boring-avatars";
import { UserPlus, MapPin, LogIn } from "react-feather";

import CStyles from "../../common/common_styles";
import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";
import BounceLoader from "react-spinners/BounceLoader";
import config from "../../../config";

import $ from "jquery";
import { inAuthContext } from "../PageBP/PageBP";

type ProfileData = {
    username: string,
    description: string,
    location: string,
    bookmarks: string[],
    likes: string[]
}

type Props = {
    principalOwnsProfile: boolean,
    user: CognitoUser | null,
    hasLoaded: boolean,
    dark: boolean,
    localStorage: Storage
};
type State = {
    dark: boolean,
    isEditing: boolean,
    profile: ProfileData | null,
    hasLoaded: boolean,
    hasMadeRequest: boolean,
    editDesc: string
};

export default class ProfileCard extends React.Component<Props, State> {

    static defaultProps = {
        principalOwnsProfile: false,
        user: null,
        hasLoaded: true,
        dark: false
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            dark: false,
            isEditing: false,
            profile: null,
            hasLoaded: false,
            hasMadeRequest: false,
            editDesc: ""
        };

        this.getProfile();
    }

    getProfile() {
        /*const profileStr = localStorage.getItem("profile");
        if (profileStr !== null) {
            const profile: ProfileData = JSON.parse(profileStr);
            if (profile.username === this.props.user?.getUsername()) {
                this.setState({ profile: profile, hasLoaded: true });
                return;
            }
        }*/

        if (!this.props.user) return;
        inAuthContext(this.fetchProfile, this.props.user);
    }

    fetchProfile = (session: CognitoUserSession) => {
        if (!this.props.user) return;

        fetch(config.endpoints.getProfile, {
            method: "POST",
            body: JSON.stringify({ username: this.props.user.getUsername() }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': session!.getAccessToken().getJwtToken(),
            }
        })
            .then(res => res.json())
            .then(data => {
                data = data.body.user;
                this.setState({ profile: data, editDesc: data.description, hasLoaded: true });
                this.props.localStorage.setItem("profile", JSON.stringify(data));
            });
    }

    updateUserProfile = async () => {
        if (this.props.user == null) return;
        this.setState({ hasLoaded: false });

        const body = {
            username: this.props.user.getUsername(),
            location: $("#location-field").val(),
            description: this.state.editDesc,
            bookmarks: this.state.profile?.bookmarks,
            likes: this.state.profile?.likes
        };

        await fetch(config.endpoints.updateUserProfile, {
            method: "POST",
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(data => {
                this.setState({ profile: data.user, hasLoaded: true });
                $("#location-field").val(data.user.location);
                $("#description-field").val(data.user.description);
                this.props.localStorage.setItem("profile", JSON.stringify(data.user));
            });
    }

    componentDidUpdate() {
        window.onbeforeunload = this.state.isEditing ? () => true : null;
        /*if (this.props.hasLoaded && !this.state.hasMadeRequest) {
            this.setState({ hasMadeRequest: true }, this.getProfile);
        }*/
    }

    componentDidMount = this.componentDidUpdate

    componentWillUnmount() {
        window.onbeforeunload = null;
    }

    truncate(text: string, maxLength: number) {
        var ret = text;
        if (ret.length > maxLength) {
            ret = ret.slice(0, maxLength - 3) + "...";
        }
        return ret;
    }

    render() {
        if (!this.props.hasLoaded
            || (this.props.user != null && !this.state.hasLoaded)
        ) return (
            <div
                style={{
                    background: (this.props.dark ? "#1A1A1B" : "white"),
                    border: (this.props.dark ? "4px solid #444" : "4px solid #dcdcdc"),
                    width: "100%", borderRadius: ".35rem"
                }}
            >
                <br />
                <div style={{ height: 50, width: 50, marginTop: 50, marginBottom: 30, display: "table", marginLeft: "auto", marginRight: "auto" }}>
                    <BounceLoader loading={true} color={this.props.dark ? "white" : "#666"} size={50} />
                </div>
                <br />
            </div>
        )

        if (this.props.user !== null && this.state.profile !== null) return (
            <>
                <div
                    style={{
                        background: (this.props.dark ? "#1A1A1B" : "white"),
                        border: (this.props.dark ? "4px solid #444" : "4px solid #dcdcdc"),
                        width: "100%", borderRadius: ".35rem"
                    }}
                    className={cx(css`
                        & > div > #profile-edit-btn {
                            display: none;
                        }
                        &:hover > div > #profile-edit-btn {
                            display: inline-block;

                        }
                        #description-field {
                            color: #666;
                        }
                    `, this.props.dark && css`
                        #description-field {
                            color: whitesmoke !important;
                        }
                    `)}
                >
                    <div style={{ width: "100%", borderTopRightRadius: ".35rem", borderTopLeftRadius: ".35rem" }}>
                        {
                            !this.state.isEditing ? (
                                <Button
                                    id="profile-edit-btn"
                                    size="sm"
                                    variant="light"
                                    style={{
                                        position: "absolute",
                                        top: 10, right: 25,
                                        fontFamily: "Jost",
                                        borderRadius: ".35rem",
                                        border: "3px solid",
                                        borderColor: (this.props.dark ? "#666" : "#dcdcdc"),
                                        background: "transparent"
                                    }}
                                    className={cx(this.props.dark ? css`
                                        border-color: #666;
                                        color: #AAA;
                                        &:hover, &:focus, &:active {
                                            color: #AAA !important;
                                            background: rgba(255, 255, 255, 0.2) !important;
                                        }
                                    ` : css`
                                        border-color: #dcdcdc;
                                        color: black;
                                    `)}
                                    onClick={() => { this.setState({ isEditing: true }); }}
                                >Edit</Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="outline-danger"
                                    style={{
                                        position: "absolute",
                                        top: 10, right: 25,
                                        borderWidth: 3,
                                        fontFamily: "Jost",
                                        borderRadius: ".35rem"
                                    }}
                                    onClick={() => { this.setState({ isEditing: false }); this.updateUserProfile(); }}
                                >Save</Button>
                            )
                        }
                        <br />
                        <br />
                        <div style={{ display: "inline-block", position: "relative", left: "calc(50% - 55px)", top: "calc(50% - 50px)", borderRadius: "50%", background: "whitesmoke", padding: 5 }}>
                            <Avatar
                                size={100}
                                name={this.props.user.getUsername()}
                                variant="marble"
                                colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                            />
                        </div>
                    </div>
                    <div hidden={this.state.isEditing} style={{ marginBottom: 10 }}>
                        <h5 className="text-center"
                            style={{ fontFamily: "Jost", fontWeight: "bold", marginTop: 15, color: "#444", marginBottom: 5 }}
                        >
                            <Link
                                to={`/user/${this.props.user.getUsername()}`}
                                className={cx(css`
                                    ${this.props.dark && "color: whitesmoke !important;"}
                                    &:hover {
                                        background: ${this.props.dark ? "#333" : "whitesmoke"};
                                        border-radius: 0.35rem;
                                        padding: 3px 10px;
                                    }
                                `, CStyles.flat_link)}
                            >
                                {this.props.user.getUsername()}
                            </Link>
                        </h5>
                        <p style={{ textAlign: "center", fontFamily: "Jost", color: "#666", fontSize: ".9rem", paddingLeft: 30, paddingRight: 30, marginTop: 2 }}>
                            <MapPin size={17} style={{ position: "relative", bottom: 1 }} />
                            &nbsp;
                            {
                                (this.state.profile !== null && !!this.state.profile.location) ? this.state.profile.location : "Earth"}
                        </p>
                        <p id="description-field" style={{ textAlign: "center", fontFamily: "Jost", fontSize: ".85rem", marginBottom: 0, padding: "10px 45px 20px", lineHeight: 1.3 }}>
                            {
                                this.state.profile.description
                                    ? this.truncate(this.state.profile.description, 200)
                                    : "This user prefers to stay anonymous!"
                            }
                        </p>
                        <br />
                    </div>
                    <div
                        style={{
                            padding: "15px 30px"
                        }}
                        hidden={!this.state.isEditing}
                    >
                        <Form className={cx(this.props.dark && css`
                            .form-label {
                                color: white;
                            }

                            .form-control {
                                background: rgba(255, 255, 255, 0.2);
                                border-color: #666;
                                color: white;
                            }
                        `)}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <small>Username</small>
                                </Form.Label>
                                <Form.Control type="username" placeholder="Enter username" defaultValue={this.props.user.getUsername()} size="sm" />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <small>Location</small>
                                </Form.Label>
                                <Form.Control
                                    id="location-field"
                                    defaultValue={!!this.state.profile ? this.state.profile.location : undefined}
                                    placeholder="Careful with this one!"
                                    size="sm"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <small>Description</small>
                                </Form.Label>
                                <Form.Control
                                    defaultValue={!!this.state.profile ? this.state.profile.description : undefined}
                                    as="textarea" rows={3}
                                    placeholder="Describe yourself!" size="sm"
                                    value={this.state.editDesc}
                                    onChange={(e) => {
                                        this.setState({ editDesc: (e.target.value.slice(0, 400) as string) });
                                    }}
                                />
                                <Form.Text className="text-muted">
                                    {this.state.editDesc.length}/400
                                </Form.Text>
                            </Form.Group>
                        </Form>
                    </div>
                </div>
            </>
        );
        return (
            <>
                <div
                    style={{
                        background: (this.props.dark ? "#1A1A1B" : "white"),
                        border: (this.props.dark ? "4px solid #444" : "4px solid #dcdcdc"),
                        color: (this.props.dark ? "white" : "black"),
                        width: "100%", borderRadius: ".35rem", padding: 25,
                        fontFamily: "Jost"
                    }}

                >
                    <img
                        alt="Namespace Logo"
                        src="/assets/img/svg/logo.svg"
                        height={43} width={43}
                        style={{
                            borderRadius: ".25rem",
                            marginBottom: 12, padding: 5
                        }}
                    />
                    &nbsp;
                    <span style={{ fontFamily: "Jost, sans-serif", fontSize: "22pt", fontWeight: "bold" }}>
                        Namespace
                        <sup style={{ color: "#666" }}><small>{config.version}</small></sup>
                    </span>
                    <div style={{ padding: 5, fontVariant: "small-caps" }}>
                        <Link to="/auth/login">
                            <Button size="lg" variant="primary" style={{ borderRadius: ".35rem", width: "100%", margin: 5 }}>
                                <LogIn style={{ position: "relative", bottom: 2 }} size={20} />
                                &nbsp;
                                Log In
                            </Button>
                        </Link>
                        <Link to="/auth/signup">
                            <Button
                                variant="light"
                                style={{ borderRadius: ".35rem", width: "100%", margin: 5, border: "1px solid #dcdcdc" }}
                                className={cx(this.props.dark && css`
                                        background: #444;
                                        border-color: #444 !important;
                                        &, &:hover { color: white; }
                                        &:hover {
                                            background: #666;
                                            border-color: #666 !important;
                                        }
                                    `)}
                            >
                                <UserPlus style={{ position: "relative", bottom: 2 }} size={15} />
                                &nbsp;
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </>
        )
    }
}