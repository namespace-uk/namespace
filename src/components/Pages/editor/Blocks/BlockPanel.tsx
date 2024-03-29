import * as React from "react";
import { Button } from "react-bootstrap";
import { css, cx } from "@emotion/css";
import { ChevronDown, ChevronUp, Edit3, Trash2 } from "react-feather";

type Props = {
    id: string,
    showEditModal: () => void,
    removeBlock: (x: string) => void,
    editBlock: (x: string) => void,
    moveBlockUp: (x: string) => void,
    moveBlockDown: (x: string) => void,
    setDidEdit: () => void,
    dark?: boolean
};
type State = {};

const Styles = {
    text_btn_style: css`
        margin-bottom: 5px;
        width: 40px;
        height: 40px;
        border-radius: 0.35rem;
        border-width: 2px;
        transition-duration: 0;
        padding: 6px;
        padding-left: 7px;
        transition-duration: 0s;
    `,
    white_bg: (x: boolean) => css`
        &:not(:hover) {
            background: ${ x ? "#1A1A1B" : "white" };
        }
    `
};

export default class BlockPanel extends React.Component<Props, State> {

    render() {
        return (
            <>
                <div 
                    style={{ 
                        width: "100%", padding: 5, 
                        background: this.props.dark ? "#1A1A1B" : "rgba(0, 0, 0, 0.1)", 
                        borderRadius: ".35rem", marginBottom: 5, 
                        fontFamily: "Jost" 
                    }}
                    className={cx(css`
                        @media(min-width: 992px) {
                            display: none;
                        }
                    `)}
                >
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => { this.props.moveBlockUp(this.props.id); this.props.setDidEdit(); }}
                        style={{ height: 32, padding: 2, paddingRight: 2, borderWidth: "2px", transitionDuration: "0s", fontSize: "10pt"  }}
                        className={cx(Styles.white_bg(!!this.props.dark) )}
                    >
                        &nbsp;
                        <ChevronUp size={16} style={{ position: "relative", bottom: 1, right: -1 }}/>
                        &nbsp;
                        Up
                        &nbsp;
                    </Button>
                    &nbsp;
                    <Button 
                        variant="outline-secondary" 
                        className={cx(Styles.white_bg(!!this.props.dark))}
                        style={{ height: 32, padding: 2, paddingRight: 2, borderWidth: "2px", transitionDuration: "0s", fontSize: "10pt"  }}
                        onClick={() => { this.props.moveBlockDown(this.props.id); this.props.setDidEdit(); }}   
                    >
                        &nbsp;
                        <ChevronDown size={16} style={{ position: "relative", right: -1 }}/>
                        &nbsp;
                        Down
                        &nbsp;
                    </Button>
                    &nbsp;
                    <Button 
                        variant="outline-primary" 
                        className={cx(Styles.white_bg(!!this.props.dark))}
                        style={{ height: 32, padding: 2, paddingRight: 2, borderWidth: "2px", transitionDuration: "0s", fontSize: "10pt"  }}
                        onClick={this.props.showEditModal}
                        id={`edit-${this.props.id}`}
                    >
                        &nbsp;&nbsp;
                        <Edit3 size={15} style={{ position: "relative", bottom: 2 }}/>
                        &nbsp;
                        Edit
                        &nbsp;
                    </Button>
                    &nbsp;
                    <Button 
                        variant="outline-danger" 
                        className={cx(Styles.white_bg(!!this.props.dark))}
                        style={{ height: 32, padding: 4, paddingRight: 2, borderWidth: "2px", transitionDuration: "0s", fontSize: "10pt" }}
                        onClick={() => this.props.removeBlock(this.props.id)}
                    >
                        &nbsp;
                        <Trash2 size={15} style={{ position: "relative", bottom: 2 }}/>
                        &nbsp;
                        Delete
                        &nbsp;
                    </Button>
                </div>
                <div 
                    id={`block-panel-${this.props.id}`} 
                    style={{ position: "absolute", left: -90, fontFamily: "Jost", padding: 6, background: this.props.dark ? "#1A1A1B" : "#dcdcdc" , borderRadius: ".7rem" }}
                    className={cx(css`
                        @media(max-width: 992px) {
                            display: none;
                        }
                    `)}
                >
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => { this.props.moveBlockUp(this.props.id); this.props.setDidEdit(); }}
                        className={cx(Styles.white_bg(!!this.props.dark), Styles.text_btn_style)}
                        style={{ height: 40 }}
                    >
                        <ChevronUp size={24} style={{ position: "relative", bottom: 2, right: 1 }}/>
                    </Button>
                    <Button 
                        variant="outline-primary" 
                        id={`edit-${this.props.id}`}
                        className={cx(Styles.white_bg(!!this.props.dark), Styles.text_btn_style)}
                        style={{ marginLeft: 5 }}
                        onClick={this.props.showEditModal}
                    >
                        <Edit3 size={20} style={{ position: "relative", bottom: 2 }}/>
                    </Button>
                    <br/>
                    <Button 
                        variant="outline-secondary" 
                        className={cx(Styles.white_bg(!!this.props.dark))}
                        style={{ width: 40, padding: 6, paddingLeft: 7, borderWidth: "2px", transitionDuration: "0s", height: 40 }}
                        onClick={() => { this.props.moveBlockDown(this.props.id); this.props.setDidEdit(); }}   
                    >
                        <ChevronDown size={24} style={{ position: "relative", right: 1 }}/>
                    </Button>
                    <Button 
                        variant="outline-danger" 
                        className={cx(Styles.white_bg(!!this.props.dark))}
                        style={{ width: 40, padding: 6, paddingLeft: 7, marginLeft: 5, borderWidth: "2px", transitionDuration: "0s" }}
                        onClick={() => this.props.removeBlock(this.props.id)}
                    >
                        <Trash2 size={20} style={{ position: "relative", bottom: 2 }}/>
                    </Button>
                </div>
                {/*<div 
                    id={`block-panel-sm-${this.props.id}`} 
                    style={{ padding: 6, background: "#dcdcdc" }}
                    className={cx(css`
                        border-radius: .7rem;
                        display: none;
                        position: relative;
                        top: 50px;
                        left: 10px;
                    `, "show-on-hover")}
                >
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => { this.props.moveBlockUp(this.props.id); this.props.setDidEdit(); }}
                        className={cx(Styles.white_bg(!!this.props.dark), Styles.text_btn_style)}
                        style={{ width: 30, height: 30, padding: 3, margin: 0, marginRight: 5 }}
                    >
                        <ChevronUp size={16} style={{ position: "relative", bottom: 5 }}/>
                    </Button>
                    <Button 
                        variant="outline-secondary" 
                        style={{ width: 30, height: 30, padding: 3, borderWidth: "2px", transitionDuration: "0s" }}
                        onClick={() => { this.props.moveBlockDown(this.props.id); this.props.setDidEdit(); }}   
                        className={cx(Styles.white_bg(!!this.props.dark))}
                    >
                        <ChevronDown size={16} style={{ position: "relative", bottom: 3 }}/>
                    </Button>
                    <Button 
                        variant="outline-primary" 
                        id={`edit-${this.props.id}`}
                        className={cx(Styles.white_bg(!!this.props.dark), Styles.text_btn_style)}
                        style={{ width: 30, height: 30, padding: 3, margin: 0, marginLeft: 5 }}
                        onClick={this.props.showEditModal}
                    >
                        <Edit3 size={15} style={{ position: "relative", bottom: 4 }}/>
                    </Button>
                    <Button 
                        variant="outline-danger" 
                        className={cx(Styles.white_bg(!!this.props.dark))}
                        style={{ width: 30, height: 30, padding: 3, marginLeft: 5, borderWidth: "2px", transitionDuration: "0s" }}
                        onClick={() => this.props.removeBlock(this.props.id)}
                    >
                        <Trash2 size={15} style={{ position: "relative", bottom: 4 }}/>
                    </Button>
                    </div>*/}
            </>
        )
    }

}