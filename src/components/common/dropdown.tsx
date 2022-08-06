import * as React from "react";

import { css, cx } from "@emotion/css";

import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import { ReactElement } from "react-markdown/lib/react-markdown";

export const MenuBtn: React.FC<{ onClick?: React.MouseEventHandler<HTMLElement>, children?: React.ReactNode }> = props => (
    <Button
        variant="light"
        style={{ width: "100%" }}
        className={cx(css`
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
        ` )}
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
                        background: #1A1A1B;
                        .arrow::after {
                            border-bottom-color: #1A1A1B;
                        }
                        border-color: #666 !important;
                        hr {
                            border-color: #444;
                        }
                        h6 { color: white; }
                        .btn {
                            background: #1A1A1B;
                            color: white;
                            &:hover {
                            background: #444;
                            }
                        }
                    ` : css`
                        background: white;
                        border-color: #dcdcdc !important;
                    `
                    ))}
                style={{
                    border: "1px solid",
                    padding: 10, borderRadius: ".35rem",
                    fontFamily: "Jost", width: 250
                }}
            >
                {props.overlay}
            </Popover>
        }
    >
        {props.children}
    </OverlayTrigger>
);

export default DropdownOnClick;