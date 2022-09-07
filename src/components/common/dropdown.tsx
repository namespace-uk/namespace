import * as React from "react";

import { css, cx } from "@emotion/css";

import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import { ReactElement } from "react-markdown/lib/react-markdown";
import PageBP from "./PageBP/PageBP";
import { X as Cross } from "react-feather";

export const MenuBtn: React.FC<{ onClick?: React.MouseEventHandler<HTMLElement>, dark: boolean, children?: React.ReactNode }> = props => (
    <Button
        style={{ width: "100%" }}
        className={PageBP.Styles.button(props.dark)}
        onClick={props.onClick}
    >
        {props.children}
    </Button>
);

const DropdownOnClick: React.FC<{
    overlay: React.ReactNode,
    popoverId: string,
    dark?: boolean,
    placement?: 'top' | 'bottom' | 'left' | 'right',
    children: ReactElement
}> = props => (
    <OverlayTrigger
        trigger="click"
        rootClose
        placement={props.placement}
        overlay={
            <Popover
                id={props.popoverId}
                className={
                    cx("shadow", (props.dark ? css`
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
                    borderRadius: ".55rem",
                    fontFamily: "Jost", width: 250
                }}
            >
                <div
                    style={{
                        padding: "3px 12px",
                        borderBottom: "1px solid",
                        borderColor: props.dark ? "#343434" : "#dcdcdc",
                        fontWeight: "bold",
                        color: props.dark ? "#dcdcdc" : "#333"
                    }}
                >
                    More
                    <span
                        style={{ float: "right" }}
                        className={cx(css`
                            &:hover {
                                cursor: pointer;
                                color: #999;
                            }
                        `)}
                        onClick={() => document.body.click()}
                    >
                        <Cross size={18} />
                    </span>
                </div>
                <div style={{ padding: 10 }}>
                    {props.overlay}
                </div>
            </Popover>
        }
    >
        {props.children}
    </OverlayTrigger>
);

export default DropdownOnClick;