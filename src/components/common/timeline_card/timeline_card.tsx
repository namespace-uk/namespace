import * as React from "react";
import { Link } from "react-router-dom";

import { cx, css } from "@emotion/css";
import GlobalStyles from "../../GlobalStyles";
import Avatar from "boring-avatars";
import { Book, Eye, EyeOff, Heart, MoreHorizontal, X as Cross } from "react-feather";
import PageBP from "../PageBP/PageBP";
import CommonType from "../types";
import CStyles from "../../common/common_styles";
import DropdownOnClick, { MenuBtn } from "../dropdown";
import { Button, Modal } from "react-bootstrap";
import { BounceLoader, PulseLoader } from "react-spinners";

import $ from "jquery";

enum ActiveState {
    ON,
    PENDING,
    OFF
};

const TimelineCard: React.FC<{
    guide: CommonType.Guide,
    dark: boolean,
    hideMore?: boolean,
    liked?: boolean,
    moreData?: {
        lists: ({
            l: CommonType.List,
            activeState: ActiveState
        })[],
        index: number,
        toggleListInclude: (x: string, y: number) => void
    }
}> = props => {
    const [showAddToListModal, setShowAddToListModal] = React.useState(false);

    return (
        <>
            {
                props.moreData && (
                    <Modal
                        size="sm"
                        show={showAddToListModal}
                        onShow={() => $(`#more-btn-${props.moreData?.index}`).trigger("click")}
                        onHide={() => setShowAddToListModal(false)}
                        className={cx(css`
                            .modal-content {
                                border-radius: .45rem;
                                border-width: 0px;
                            }
                        `)}
                        centered
                    >
                        <Modal.Body
                            style={{
                                fontFamily: "Jost",
                                padding: "30px 30px 20px 30px",
                                background: (props.dark ? "#1A1A1B" : undefined),
                                color: (props.dark ? "whitesmoke" : "#333"),
                                border: "1px solid",
                                borderRadius: ".35rem",
                                borderColor: (props.dark ? "#444" : "#dcdcdc")
                            }}
                        >
                            <h5 style={{ fontWeight: "bold" }}>
                                Choose a List
                                <Cross
                                    style={{ float: "right" }}
                                    className={cx(css`
                                        opacity: .5;
                                        &:hover {
                                            cursor: pointer;
                                            opacity: .9 !important;
                                        }
                                    `)}
                                    onClick={() => setShowAddToListModal(false)}
                                />
                            </h5>
                            <br />
                            {
                                props.moreData ? props.moreData.lists.map(x => (
                                    <Button
                                        style={{ border: 0, width: "100%", marginBottom: 10 }}
                                        className={cx(props.dark ? css`
                                            background: #444 !important;
                                            color: whitesmoke;
                                            &:hover, &:active, &:focus {
                                                background: #666 !important;
                                            }
                                        ` : css`
                                            background: whitesmoke !important;
                                            &, &:hover, &:active, &:focus {
                                                color: #333 !important;
                                            }
                                            &:hover, &:active, &:focus {
                                                background: #DDD !important;
                                            }
                                        `, x.activeState === ActiveState.ON && css`
                                            border: 3px solid var(--success) !important;
                                            padding: calc(.375rem - 3px) calc(.75rem - 3px);
                                        `, x.activeState === ActiveState.PENDING && css`
                                            border: 3px solid var(--primary) !important;
                                            padding: calc(.375rem - 3px) calc(.75rem - 3px);
                                            opacity: .5;
                                        `)}
                                        onClick={() => { if (props.moreData) props.moreData.toggleListInclude(x.l.id, props.moreData.index); }}
                                        disabled={x.activeState === ActiveState.PENDING}
                                    >
                                        {x.l.header}
                                        <span
                                            style={{ zIndex: 3, position: "absolute", right: "calc(50% - 20px)" }}
                                            hidden={x.activeState !== ActiveState.PENDING}
                                        >
                                            <PulseLoader color="var(--primary)" size={10} />
                                        </span>
                                    </Button>
                                )) : <BounceLoader size={40} color={props.dark ? "whitesmoke" : "#666"} />
                            }
                            {
                                props.moreData && props.moreData.lists.length === 0 && (
                                    <div
                                        className={cx("text-center list-group-item-primary",
                                            (props.dark && css`
                                            background: #444;
                                            color: whitesmoke;
                                        `)
                                        )}
                                        style={{ borderRadius: ".35rem", padding: 20, fontFamily: "Jost" }}
                                    >
                                        You have no lists! Create one at  <Link
                                            to="/lists"
                                            style={{
                                                textDecoration: "underline",
                                                color: props.dark ? "whitesmoke" : "black"
                                            }}
                                        >My Lists</Link>.
                                    </div>
                                )
                            }
                        </Modal.Body>
                    </Modal>
                )
            }
            <Link
                to={`/g/${props.guide.id}`}
                style={{ fontFamily: "Jost" }}
                className={GlobalStyles.FLAT_LINK}
            >
                <div
                    className={cx(
                        PageBP.Styles.component(props.dark),
                        css`
                            width: 100%;
                            border-radius: ${props.hideMore ? ".45rem" : "var(--radius-md)"};
                            border: 1px solid;
                            padding: 26px 30px 25px 30px;
                            transition: border-width .07s, padding .07s;
                    
                            &:hover {
                                border-color: ${props.dark ? "#666" : "#c4c4c4"};
                                border-width: 2px;
                                padding: 25px 29px 24px 29px;
                                cursor: pointer;
                            }
                        `
                    )}
                >

                    {
                        !props.hideMore && props.moreData && (
                            <div style={{ position: "absolute", right: 43, marginTop: -2, width: 35, height: 35 }}>
                                <DropdownOnClick
                                    popoverId="guide-more-dropdown"
                                    placement="bottom"
                                    dark={props.dark}
                                    overlay={
                                        <Link to="#" onClick={(e) => e.preventDefault()}>
                                            <MenuBtn onClick={() => setShowAddToListModal(true)}>
                                                <Book size={17} style={{ position: "relative", bottom: 2 }} color="#666" />&nbsp;
                                                Add to List
                                            </MenuBtn>
                                        </Link>
                                    }
                                >
                                    <Link to="#" onClick={(e) => e.preventDefault()}>
                                        <div
                                            id={props.moreData && `more-btn-${props.moreData?.index}`}
                                            className={cx(css`
                                                padding: 5px;
                                                border-radius: .35rem;
                                                color: ${props.dark ? "#444" : "grey"};
                                                &:hover {
                                                    color: ${props.dark ? "white" : "#555"};
                                                    cursor: pointer;
                                                    background: ${props.dark ? "#444" : "whitesmoke"};
                                                }
                                            `)}
                                        >
                                            <span style={{ position: "relative", bottom: 1 }}>
                                                <MoreHorizontal size={24} />
                                            </span>
                                        </div>
                                    </Link>
                                </DropdownOnClick>
                            </div>
                        )
                    }
                    {
                        props.hideMore ? <h5 style={{ fontWeight: "bold" }}>
                            {props.guide.header}
                        </h5> : (
                            <h3
                                style={{ fontWeight: "bold" }}
                                className={cx(css`
                                    ${!props.hideMore && "max-width: calc(100% - 40px);"}
                                    max-height: 4rem;
                                    overflow: hidden;
                                    display: -webkit-box;
                                    -webkit-line-clamp: 2;
                                    -webkit-box-orient: vertical; 
                                `)}
                            >{props.guide.header}</h3>
                        )
                    }
                    <h6 style={{ color: "gray", margin: 0 }}>{(new Date(props.guide.timestamp)).toDateString()}</h6>
                    {
                        props.guide.description && (
                            <>
                                <div style={{ height: 20 }} />
                                <p
                                    style={{ margin: 0, wordBreak: "break-word", overflow: "hidden", fontFamily: "Jost" }}
                                    className={cx(css`
                                        display: -webkit-box;
                                        -webkit-line-clamp: 2;
                                        -webkit-box-orient: vertical; 
                                    `)}
                                >
                                    {props.guide.description}
                                </p>
                            </>
                        )
                    }
                    {
                        <>
                            <hr style={{ margin: "10px 0px 10px 0px" }} />
                            <div style={{ height: 25 }}>
                                <Link
                                    to={`/user/${props.guide.user}`}
                                    style={{
                                        padding: "5px 10px",
                                        fontSize: "14pt",
                                        fontWeight: "bold",
                                        borderRadius: ".35rem"
                                    }}
                                    className={cx(props.dark ? css`
                                        color: white !important;
                                        &:hover {
                                            background: #444;
                                            cursor: pointer;
                                        }
                                    ` : css`
                                        &:hover {
                                            background: whitesmoke;
                                            cursor: pointer;
                                        }
                                    `, CStyles.flat_link)}
                                >
                                    <span style={{ position: "relative", bottom: 2 }}>
                                        <Avatar
                                            size={22}
                                            name={props.guide.user}
                                            variant="marble"
                                            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                        />
                                    </span>
                                    {!props.hideMore && (
                                        <>&nbsp;&nbsp;{props.guide.user}</>
                                    )}
                                </Link>
                                <span style={{ padding: 5, float: "right", color: "grey", position: "relative", bottom: 3 }}>
                                    {
                                        props.guide.isPrivate ? (
                                            <>
                                                <span style={{ position: "relative", bottom: 1 }}>
                                                    <EyeOff size={18} />
                                                </span>
                                            </>
                                        ) : (
                                            <span style={{ color: props.dark ? "#54aeff" : "inherit" }}>
                                                <span style={{ position: "relative", bottom: 1 }}>
                                                    <Eye size={18} />
                                                </span>
                                                &nbsp;
                                                {props.guide.views ? props.guide.views : 0}
                                            </span>
                                        )
                                    }
                                    &nbsp;
                                    &middot;
                                    &nbsp;
                                    <span style={{ position: "relative", bottom: 2 }}>
                                        <Heart color="var(--danger)" fill={props.liked ? "var(--danger)" : "none"} size={18} />
                                    </span>
                                    &nbsp;
                                    <span style={{ color: "var(--danger)" }}>
                                        {props.guide.likes ? props.guide.likes : 0}
                                    </span>
                                    &nbsp;
                                </span>
                            </div>
                        </>
                    }
                </div>
            </Link>
            <br />
        </>
    );
}

export default TimelineCard;