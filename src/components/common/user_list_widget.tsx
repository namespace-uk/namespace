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
        border: 3px solid;
        border-radius: .55rem;
        width: 100%:
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
            border-color: #343434;
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
                    style={{
                        padding: "38px 20px",
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: ".45rem",
                        background: this.props.dark ? "#161616" : "white"
                    }}
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
                    borderColor: this.props.dark ? "#343434" : "#dcdcdc",
                    borderRadius: ".55rem"
                }}
            >
                <ListGroup.Item
                    style={{
                        background: this.props.dark ? "#161616" : "whitesmoke",
                        color: this.props.dark ? "whitesmoke" : "#333",
                        border: "1px solid", borderRadius: ".4rem .4rem 0px 0px",
                        borderWidth: 0, borderBottomWidth: 2.4,
                        borderColor: this.props.dark ? "#343434" : "#dcdcdc"
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
                                        border: 1px solid #343434;
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
                                    `, css`
                                        ${i === this.props.lists.length - 1 ? "border-radius: 0px 0px .4rem .4rem !important;border-bottom: 0px;" : "border-radius: 0px !important;"}
                                        border-left-width: 0px;
                                        border-right-width: 0px;
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
                                    border: 0px solid #343434;
                                ` : css`
                                    background: white;
                                    color: #333;
                                    border: 0px solid #dcdcdc;
                                `)}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: ".35rem",
                                    borderTopRightRadius: 0,
                                    borderTopLeftRadius: 0,
                                    textAlign: "center",
                                    borderTopWidth: 1
                                }}
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