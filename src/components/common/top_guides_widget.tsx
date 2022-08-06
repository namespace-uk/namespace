import { css, cx } from "@emotion/css";
import * as React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { ChevronUp, Eye } from "react-feather";
import { Link } from "react-router-dom";
import CStyles from "../common/common_styles";
import config from "../../config";
import { BounceLoader } from "react-spinners";

type Guide = { header: string, id: string, views: number };

enum LoadingState {
    IDLE,
    LOADING,
    DONE
};

type Props = {
    dark: boolean
};
type State = {
    guides: Guide[],
    loadingState: LoadingState
}

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

export default class TopGuidesWidget extends React.Component<Props, State> {

    static defaultProps: Props = {
        dark: false
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            guides: [],
            loadingState: LoadingState.LOADING
        };

        this.init();
    }

    init = async () => {
        await fetch(config.endpoints.getTopGuides)
            .then(res => {
                if (res.status !== 200) return Promise.reject(res);
                return res.json();
            })
            .then(data => {
                this.setState({ guides: data, loadingState: LoadingState.DONE });
            });
    }

    render() {
        if (this.state.loadingState === LoadingState.LOADING) return (
            <ListGroup
                className={cx(Styles.positional_s, (this.props.dark ? Styles.dark_s : Styles.light_s))}
            >
                <ListGroupItem
                    style={{ padding: "38px 20px", fontSize: "1.25rem", fontWeight: "bold", borderTop: 0, borderBottomWidth: 2, background: this.props.dark ? "#1A1A1B" : "white" }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BounceLoader size={50} color={this.props.dark ? "whitesmoke" : "#666"} />
                    </div>
                </ListGroupItem>
            </ListGroup>
        )

        return (
            <ListGroup
                className={cx(Styles.positional_s, (this.props.dark ? Styles.dark_s : Styles.light_s))}
            >
                <ListGroupItem
                    style={{ padding: "18px 20px", fontSize: "1.25rem", fontWeight: "bold", borderTop: 0, borderBottomWidth: 2, background: this.props.dark ? "#1A1A1B" : "whitesmoke" }}
                    className={cx(css`
                        ${!this.props.dark && "background: whitesmoke !important;"}
                    `)}
                >
                    <ChevronUp size={32} color="var(--success)" style={{ strokeWidth: 3, position: "relative", bottom: 2, marginRight: 5 }} />
                    Top Guides
                </ListGroupItem>
                {
                    this.state.guides.map((x, i) => (
                        <Link to={`/gr/${x.id}`} className={cx(CStyles.flat_link, "top-guide-link")}>
                            <ListGroupItem className={cx(css`
                                ${i === 4 ? "border-top-right-radius: 0px !important;border-top-left-radius: 0px !important;border-bottom: 0px;" : "border-radius: 0px !important;"}
                                &:hover {
                                    cursor: pointer;
                                    background: whitesmoke;
                                }
                            `)}>
                                <span style={{ fontSize: "1em" }}>{x.header}</span>
                                &nbsp;&nbsp;
                                <small style={{ color: this.props.dark ? "#54aeff" : "grey" }}>
                                    <Eye size={13} style={{ position: "relative", marginBottom: 2 }} />&nbsp;
                                    {x.views}
                                </small>
                            </ListGroupItem>
                        </Link>
                    ))
                }
            </ListGroup>
        )
    }

}