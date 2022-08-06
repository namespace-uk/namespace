import { css, cx } from "@emotion/css";
import * as React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { Folder } from "react-feather";
import { Link } from "react-router-dom";
import { BounceLoader } from "react-spinners";
import CommonType from "./types";
import CStyles from "./common_styles";

export enum LoadingState {
    IDLE,
    LOADING,
    DONE,
    FAILED
}

type Props = {
    dark: boolean,
    lists: CommonType.List[],
    loadingState: LoadingState
};

const Styles = {
    positional_s: css`
        border: 4px solid;
        border-radius: .35rem;
        width: 100%:
        border-right-width: 3px;
        border-left-width: 3px;
        &, .list-group-item {
            font-family: Jost;
        }
    `,
    light_s: css`
        &, .list-group-item {
            background: white;
            border-color: #dcdcdc;
        }
    `,
    dark_s: css`
        &, .list-group-item {
            background: black;
            border-color: #444;
            color: #DDD;
        }
        .top-guide-link > .list-group-item:hover {
            background: #333;
        }
    `
}

export default class UserListWidget extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.state = {
            loadingState: LoadingState.IDLE,
            lists: []
        }
    }

    init = async () => { }

    render = () => {
        if (this.props.loadingState !== LoadingState.DONE) return (
            <ListGroup
                className={cx(Styles.positional_s, (this.props.dark ? Styles.dark_s : Styles.light_s))}
            >
                <ListGroupItem
                    style={{ padding: "38px 20px", fontSize: "1.25rem", fontWeight: "bold", borderTop: 0, borderBottomWidth: 2, background: this.props.dark ? "#1A1A1B" : "whitesmoke" }}
                    className={cx(css`
                        ${!this.props.dark && "background: whitesmoke !important;"}
                    `)}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BounceLoader size={50} color={this.props.dark ? "whitesmoke" : "#666"} />
                    </div>
                </ListGroupItem>
            </ListGroup>
        );

        return (
            <ListGroup
                style={{
                    fontFamily: "Jost",
                    border: "3px solid",
                    borderColor: this.props.dark ? "#444" : "#dcdcdc",
                    borderRadius: ".4rem"
                }}
            >
                <ListGroup.Item
                    style={{
                        background: this.props.dark ? "#1A1A1B" : "whitesmoke",
                        color: this.props.dark ? "whitesmoke" : "#333",
                        border: this.props.dark ? "1px solid #444" : "1px solid #dcdcdc"
                    }}
                    className={cx(css`
                        border-bottom-width: 2px !important;
                    `)}
                >
                    <h4 style={{ margin: 0 }}>
                        Lists
                    </h4>
                </ListGroup.Item>
                <div style={{ overflowY: "auto", maxHeight: 300 }}>
                    {
                        this.props.loadingState === LoadingState.DONE &&
                        this.props.lists.map((x, i) => (
                            <Link to={`/list/${x.id}`} className={cx(CStyles.flat_link)}>
                                <ListGroup.Item
                                    className={cx(this.props.dark ? css`
                                        background: black;
                                        color: whitesmoke;
                                        border: 1px solid #444;
                                        &:hover {
                                            cursor: pointer;
                                            background: #333;
                                        }
                                    ` : css`
                                        background: white;
                                        color: #333;
                                        border: 1px solid #dcdcdc;
                                        &:hover {
                                            cursor: pointer;
                                            background: whitesmoke;
                                        }
                                    `)}
                                    style={{ padding: "10px 20px", borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
                                >
                                    <Folder size={15} fill="#54aeff" color="#54aeff" style={{ position: "relative", bottom: 1.5 }} />
                                    &nbsp;&nbsp;
                                    {x.header}
                                </ListGroup.Item>
                            </Link>
                        ))
                    }
                    {
                        this.props.lists.length === 0 && (
                            <ListGroup.Item
                                className={cx(this.props.dark ? css`
                                    background: black;
                                    color: whitesmoke;
                                    border: 1px solid #444;
                                ` : css`
                                    background: white;
                                    color: #333;
                                    border: 1px solid #dcdcdc;
                                `)}
                                style={{ padding: "10px 20px", borderTopRightRadius: 0, borderTopLeftRadius: 0, textAlign: "center" }}
                            >
                                No public lists
                            </ListGroup.Item>
                        )
                    }
                </div>
            </ListGroup>
        )
    }

}