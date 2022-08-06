import * as React from "react";
import { css, cx } from "@emotion/css";

import { ExternalLink } from "react-feather";
import { EmbedData } from "../../editor/Blocks/types";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import GlobalStyles from "../../../GlobalStyles";

type Props = {
    data: EmbedData,
    id: string
};
type State = {};

export default class Embed extends React.Component<Props, State> {

    render() {
        return (
            <figure>
                <div 
                    style={{ 
                        width: "100%", 
                        border: "1px solid #dcdcdc", 
                        borderBottom: 0,
                        borderTopRightRadius: ".35rem", 
                        borderTopLeftRadius: ".35rem", 
                        background: "white",
                        padding: "5px 6px"
                    }}
                >
                    &nbsp;
                    <OverlayTrigger 
                        trigger="hover" placement="bottom" 
                        overlay={
                            <Tooltip id={`${this.props.id}-link-tooltip`}>
                                Go to Site
                            </Tooltip>
                        }
                    >
                        <a href={this.props.data.link} className={cx(GlobalStyles.FLAT_LINK)} target="_blank">
                            <ExternalLink
                                className={cx(css`
                                    &:hover { 
                                        background: whitesmoke;
                                        cursor: pointer;
                                    }
                                `)} 
                                style={{ padding: 5, borderRadius: ".35rem" }} 
                                size={25}
                            />
                        </a>
                    </OverlayTrigger>
                    &nbsp;
                    <span className="text-muted" style={{ fontFamily: "Jost", position: "relative", top: 1 }}>
                        {this.props.data.caption || "Edit"}
                    </span>
                </div>
                <iframe 
                    src={this.props.data.link}
                    style={{ 
                        width: "100%", border: "1px solid #dcdcdc", 
                        borderRadius: ".35rem", height: 600,
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0
                    }}
                />
            </figure>
        )
    }

}