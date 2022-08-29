import React from "react";
import { Link, Redirect } from "react-router-dom";

import { Button, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import { Bookmark, Folder, Globe, Home, LogOut, Moon, Plus, Settings, Sun, User } from "react-feather";
import CStyles from "./common_styles";
import config from "../../config";

import { css, cx } from "@emotion/css";
import { CognitoUser } from "amazon-cognito-identity-js";
import Avatar from "boring-avatars";

import $ from "jquery";
import { BounceLoader } from "react-spinners";
import { MenuBtn } from "./dropdown";

const Styles = {
    header_s: css`
        height: 51px;
        border-bottom: 1px solid #dcdcdc;

    `,
    header_s_dark: css`
        height: 51px;
        border-bottom: 1px solid #343434;
    `,
    minor_header_s: css`
        border-bottom: 1px solid #dcdcdc;
        padding: 10px 5px;
        overflow: auto;
    `,
    minor_header_s_dark: css`
        border-bottom: 1px solid #343434;
        padding: 10px 5px;
        overflow: auto;
    `,
    search_s: css`
        position: relative;
        height: 40px;
        border-radius: .3rem;
        border: 1px solid #dcdcdc;
        top: 5px;
        font-family: Jost, sans-serif;
        display: table;
        margin-left: auto;
        margin-right: auto;
        padding-right: 8px;
        
        max-width: 500px;
        width: calc(100% - 5px);
        z-index: 2;
        
        &:hover, &:focus-within, &:active {
          border-color: #bbb; 
          background: white;
          #search_icon {
            display: none;
          }
          #main_search {
            padding-left: 15px;
          }
        }

        &:hover, &:active, &:focus {
            outline: 0 !important;
        }

        left: 50px;

        @media (max-width: 1092px) {
            width: calc(100vw - 620px);
            position: relative;
        }

        @media (max-width: 650px) {
            display: none;
        }
    `,
    search_s_dark: css`
        &, &:hover, &:focus-within, &:active {
            background: #333;
            input {
                color: white !important;
            }
        }
        border-color: #343434;
    `,
    inner_search_s: css`
        height: 37px; 
        padding-left: 42px;
        outline: 0;
        border: none;
        background: rgba(0, 0, 0, 0);
        width: 100%;
        transition: all .25s;
        border-radius: .26rem;
    `,
    search_label_s: css`
        position: absolute;
        top: 17px;
        margin-top: -13px;
        margin-left: 8px;   
    `,
    logo_s: css`
        color: black;
        position: relative;
        top: 2.5px;
        
        &:hover {
          text-decoration: none;
          color: rgba(0, 0, 0, 0.7);
        }
    `,
    tag_s: css`
      background: rgba(56,139,253,0.15);
      color: #0969da !important;
      padding: 6px 15px;
      margin-right: 5px;
      border-radius: 20px;
      font-family: Jost, sans-serif;
      border: 0px solid rgba(56,139,253,0.15);
      &:hover{ 
          cursor: pointer; 
          background: var(--primary);
          color: white !important;
          border-width: 3px;
          padding: 3px 12px;
      }
      white-space: nowrap;
    `,
    tag_s_dark: css`
        background: rgba(56,139,253,0.15);
        color: #58a6ff !important;
        padding: 6px 15px;
        margin-right: 5px;
        border-radius: 20px;
        font-family: Jost, sans-serif;
        border: 0px solid rgba(56,139,253,0.15);
        &:hover{ 
            cursor: pointer; 
            background: var(--primary);
            color: white !important; 
            border-width: 3px;
            padding: 3px 12px;
        }
        white-space: nowrap;
    `,
    prof_img_s: css`
      &:hover {
        cursor: pointer;
      }
    `,
    nav_icon: css`
      border: 1px solid #dcdcdc;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      width: 40px;
      vertical-align: middle;
      margin-bottom: 5px;
      border-radius: 50%;
      color: black;
      &:hover { 
          cursor: pointer; 
          background: whitesmoke; 
          color: black; 
          text-decoration: none; 
          border-width: 3px;
        }
    `,
    nav_icon_dark: css`
        border: 1px solid #666;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: 40px;
        width: 40px;
        vertical-align: middle;
        margin-bottom: 5px;
        border-radius: 50%;
        color: #d7dadc;
        &:hover { 
            cursor: pointer; 
            background: #333; 
            color: whitesmoke; 
            text-decoration: none; 
            border-width: 3px;
        }
    `,
    user_menu_btn_s: css`
        background: white;
        border: none;
        text-align: left;
        font-weight: bold;

        &, &:focus, &:active, &:hover {
            outline: none !important;
            box-shadow: none !important;
        }

        &:hover {
            background: #f8f9fa;
        }
    `
}

type State = {
    profileMenuIsOpen: boolean,
    redirectData: [false] | [true, string],
    creatingGuide: boolean
};
type Props = {
    dark: boolean,
    user: CognitoUser | null,
    setDarkMode: (x: boolean) => void,
    defaultSearchValue?: string,
    localStorage: Storage
};

export default class NsNavbar extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            profileMenuIsOpen: false,
            redirectData: [false],
            creatingGuide: false
        }

        this.signout = this.signout.bind(this);
    }

    toggleDropdown() {
        console.log("Toggled");
    }

    submitSearchQuery() {
        const queryStr = $("#main_search").val();
        if (!queryStr) return;
        window.location.href = `${window.location.origin}/search/${queryStr}`;
    }

    createGuide = () => {
        if (!this.props.user) {
            this.setState({ redirectData: [true, "/auth/login"] });
            return;
        } else this.setState({ creatingGuide: true });
        const options = {
            method: "POST",
            body: JSON.stringify({
                header: "New Guide",
                timestamp: (new Date()).toISOString(),
                blocks: [],
                user: this.props.user.getUsername(),
                isPrivate: true
            })
        };

        fetch(config.endpoints.createGuide, options)
            .then(res => {
                if (res.status !== 200) return Promise.reject(res);
                return res.json();
            }).then(data => {
                this.setState({ redirectData: [true, `/e/${data.body}`] })
            });
    }

    signout = () => {
        this.props.user?.signOut();
        this.setState({ redirectData: [true, "/auth/login"] });
    }

    toggleDarkMode = async () => {
        const currentDarkmode = this.props.localStorage.getItem("darkmode")
        const isDark = currentDarkmode === "false" || currentDarkmode === null;
        this.props.localStorage.setItem("darkmode", isDark.toString());
        this.props.setDarkMode(isDark);
    }

    render() {
        const navIconStyle = this.props.dark ? Styles.nav_icon_dark : Styles.nav_icon;

        return (
            <div style={{ background: (this.props.dark ? "#161616" : "white") }}>
                {this.state.redirectData[1] && <Redirect to={this.state.redirectData[1] as string} />}
                <header className={cx(this.props.dark ? Styles.header_s_dark : Styles.header_s)}>
                    <div style={{ display: "inline-block", position: "absolute", height: 40, top: -4, padding: "8px 15px" }}>
                        <Link to="/" className={cx(Styles.logo_s)}>
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
                            <span
                                style={{ fontFamily: "Jost, sans-serif", fontSize: "17pt", fontWeight: "bold", color: (this.props.dark ? "white" : "black") }}
                                className={cx(css`
                                    @media (max-width: 650px) {
                                        display: none;
                                    }
                                `)}
                            >
                                Namespace
                                <sup style={{ color: "#666" }}><small>{config.version}</small></sup>
                            </span>
                        </Link>
                        &nbsp;&nbsp;&nbsp;
                        <OverlayTrigger
                            key="k-home-link"
                            placement="bottom"
                            overlay={
                                <Tooltip id="home-link-tooltip">
                                    Home
                                </Tooltip>
                            }
                        >
                            <Link to="/" className={cx(navIconStyle)}>
                                <Home />
                            </Link>
                        </OverlayTrigger>
                        &nbsp;
                        <OverlayTrigger
                            key="k-bookmarks-link"
                            placement="bottom"
                            overlay={
                                <Tooltip id="new-guide-tooltip">
                                    My Bookmarks
                                </Tooltip>
                            }
                        >
                            <Link to="/bookmarks" className={cx(navIconStyle)}>
                                <Bookmark />
                            </Link>
                        </OverlayTrigger>
                        &nbsp;
                        <OverlayTrigger
                            key="k-new-guide"
                            placement="bottom"
                            overlay={
                                <Tooltip id="new-guide-tooltip">
                                    New Guide
                                </Tooltip>
                            }
                        >
                            <span className={cx(navIconStyle)} onClick={!this.state.creatingGuide ? this.createGuide : undefined}>
                                {
                                    !this.state.creatingGuide ? <Plus />
                                        : <BounceLoader size={20} color={this.props.dark ? "whitesmoke" : "black"} />
                                }
                            </span>
                        </OverlayTrigger>
                        &nbsp;
                    </div>
                    <div
                        id="search"
                        className={cx(Styles.search_s, (this.props.dark ? Styles.search_s_dark : null))}
                        style={{
                            background: this.props.dark ? "black" : "whitesmoke"
                        }}
                    >
                        <label form="main_search" htmlFor="main_search" className={cx(Styles.search_label_s)}>
                            <svg id="search_icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={this.props.dark ? "whitesmoke" : "black"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-search">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </label>
                        <form onSubmit={(e) => { e.preventDefault(); this.submitSearchQuery(); }}>
                            <input
                                className={cx(Styles.inner_search_s)}
                                id="main_search" name="main_search"
                                type="search" placeholder="Search"
                                defaultValue={this.props.defaultSearchValue}
                            />
                        </form>
                    </div>
                    <div id="prof_img" className={cx(Styles.prof_img_s)} style={{ position: "absolute", top: 2, right: 20 }}>
                        <Link
                            to="/lists"
                            style={{ position: "relative", top: 2.5, width: 83, borderRadius: 20, fontFamily: "Jost" }}
                            className={cx(navIconStyle)}
                        >
                            <Folder size={18} fill="#54aeff" color="#54aeff" style={{ position: "relative", bottom: 0 }} />
                            &nbsp;
                            Lists
                        </Link>
                        &nbsp;&nbsp;
                        <OverlayTrigger
                            key="k-dark-mode"
                            placement="bottom"
                            overlay={
                                <Tooltip id="dark-mode-tooltip">
                                    Toggle {this.props.dark ? "Light" : "Dark"} Mode
                                </Tooltip>
                            }
                        >
                            <span className={cx(navIconStyle)} style={{ position: "relative", top: 2.5 }} onClick={this.toggleDarkMode}>
                                {
                                    this.props.dark ? <Sun style={{ position: "relative", top: 0.5 }} /> : <Moon style={{ position: "relative", top: 0.5 }} />
                                }
                            </span>
                        </OverlayTrigger>
                        &nbsp;&nbsp;
                        <OverlayTrigger
                            key="k-namespaces"
                            placement="bottom"
                            overlay={
                                <Tooltip id="namespaces-tooltip">
                                    Explore Namespaces
                                </Tooltip>
                            }
                        >
                            <Link to="/spaces" className={cx(navIconStyle)} style={{ position: "relative", top: 2.5 }}>
                                <Globe style={{ position: "relative", top: 0.5 }} />
                            </Link>
                        </OverlayTrigger>
                        &nbsp;&nbsp;
                        {this.props.user ? (
                            <OverlayTrigger
                                trigger="click"
                                rootClose
                                overlay={
                                    <Popover
                                        id="usr-dropdown-pop"
                                        className={cx("shadow", (this.props.dark ? css`
                                                    background: #161616;
                                                    .arrow::after {
                                                        border-bottom-color: #161616;
                                                    }
                                                    border-color: #343434 !important;
                                                    hr {
                                                        border-color: #343434;
                                                    }
                                                    h6 { color: white; }
                                                    .btn {
                                                        background: #161616;
                                                        color: white;
                                                        &:hover {
                                                           background: #343434;
                                                        }
                                                    }
                                                ` : css`
                                                    background: white;
                                                    border-color: #dcdcdc !important;
                                                `
                                        ))}
                                        style={{
                                            border: "1px solid",
                                            borderRadius: ".35rem",
                                            fontFamily: "Jost", width: 250,
                                            transition: "all 0s"
                                        }}
                                    >
                                        <div style={{ padding: 10 }}>
                                            <h6 style={{ margin: 0, fontWeight: "bold" }}>{this.props.user.getUsername()}</h6>
                                        </div>
                                        <hr style={{ margin: 0 }} />
                                        <div style={{ padding: 10 }} className={cx(css`
                                                & > *:last-child {
                                                    border-bottom-right-radius: .4rem !important;
                                                    border-bottom-left-radius: .4rem !important;
                                                }
                                            `)}>
                                            <Link to={`/user/${this.props.user.getUsername()}`}>
                                                <MenuBtn dark={this.props.dark}>
                                                    <User size={17} style={{ position: "relative", bottom: 2 }} color="#666" />
                                                    &nbsp;
                                                    Profile
                                                </MenuBtn>
                                            </Link>
                                            <div style={{ height: 5 }} />
                                            <Link to="/bookmarks">
                                                <MenuBtn dark={this.props.dark}>
                                                    <Bookmark size={17} style={{ position: "relative", bottom: 2 }} color="#666" />
                                                    &nbsp;
                                                    Bookmarks
                                                </MenuBtn>
                                            </Link>
                                            <div style={{ height: 5 }} />
                                            <Link to="/lists">
                                                <MenuBtn dark={this.props.dark}>
                                                    <Folder size={17} style={{ position: "relative", bottom: 2 }} color="#666" />
                                                    &nbsp;
                                                    Lists
                                                </MenuBtn>
                                            </Link>
                                            <div style={{ height: 5 }} />
                                            <Link to="/preferences">
                                                <MenuBtn dark={this.props.dark}>
                                                    <Settings size={16} color="#666" />
                                                    &nbsp;
                                                    Preferences
                                                </MenuBtn>
                                            </Link>
                                            <div style={{ height: 5 }} />
                                            <MenuBtn dark={this.props.dark} onClick={this.signout}>
                                                <LogOut size={16} style={{ position: "relative", bottom: 2 }} color="#666" />
                                                &nbsp;
                                                Log Out
                                            </MenuBtn>
                                        </div>
                                    </Popover>
                                }
                                placement="bottom"
                            >

                                <span onClick={this.toggleDropdown}>
                                    <Avatar
                                        size={39}
                                        name={this.props.user.getUsername()}
                                        variant="marble"
                                        colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                    />
                                </span>
                            </OverlayTrigger>
                        ) : (
                            <OverlayTrigger
                                key="k-login-nav"
                                placement="bottom"
                                overlay={
                                    <Tooltip id="login-nav-tooltip">
                                        Log In
                                    </Tooltip>
                                }
                            >
                                <Link to="/auth/login" className={cx(navIconStyle)} style={{ position: "relative", top: 2.5 }}>
                                    <User style={{ position: "relative", top: 0.5 }} />
                                </Link>
                            </OverlayTrigger>
                        )
                        }
                    </div>
                    {/* <NavButtons/> */}
                </header>
                <header className={cx(this.props.dark ? Styles.minor_header_s_dark : Styles.minor_header_s)}>
                    {
                        ["cs140", "python", "cs141", "css", "webdev", "html", "algorithms", "math", "ethics"].map(name => (
                            <Link to={`/search/${name}?facet`} onClick={() => { this.forceUpdate() }} className={cx(CStyles.flat_link)}>
                                <span className={cx(this.props.dark ? Styles.tag_s_dark : Styles.tag_s)} style={{ background: (this.props.dark ? "" : ""), color: "black" }}>
                                    {name}
                                </span>
                            </Link>
                        ))
                    }
                </header>
                <Link id="hiddenSearchBtnLink" to={`/search/${$("#main_search").val()}`}>
                    <Button id="hiddenSearchBtn" hidden></Button>
                </Link>
            </div>
        )
    }
}