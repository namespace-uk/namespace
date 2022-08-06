import * as React from "react";

import { Copy } from "react-feather";
import { css, cx } from "@emotion/css";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CodeBlockData } from "../../editor/Blocks/types";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

type Props = {
    data: CodeBlockData,
    id: string,
    dark?: boolean
};
type State = {
    codeCopied: boolean
};

export default class CodeBlock extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            codeCopied: false
        };

        this.copyCode = this.copyCode.bind(this);
    }

    copyCode() {
        navigator.clipboard.writeText(this.props.data.code);

        this.setState({codeCopied: true}, () => {
            setTimeout(() => {this.setState({codeCopied: false})}, 1500);
        });
    }

    render() {
        return (
            <>
                <div 
                    style={{ 
                        width: "100%", 
                        border: "1px solid", 
                        borderBottom: 0,
                        borderTopRightRadius: ".35rem", 
                        borderTopLeftRadius: ".35rem", 
                        background: this.props.dark ? "#1A1A1B" : "white",
                        borderColor: this.props.dark ? "#444" : "#dcdcdc",
                        padding: "5px 6px"
                    }}
                >
                    &nbsp;&nbsp;
                    <OverlayTrigger 
                        trigger="hover" placement="bottom" 
                        overlay={
                            <Tooltip id={`${this.props.id}-copy-tooltip`}>
                                {this.state.codeCopied ? "Copied!" : "Copy"}
                            </Tooltip>
                        }
                    >
                        <Copy 
                            style={{ padding: 5, borderRadius: ".35rem" }} 
                            className={cx(css`
                                ${this.props.dark && "color: whitesmoke;"}
                                &:hover { 
                                    background: ${this.props.dark ? "#444" : "whitesmoke"};
                                    cursor: pointer;
                                }
                            `)} 
                            size={25}
                            onClick={this.copyCode}
                        />
                    </OverlayTrigger>
                    <span style={{ float: "right", color: "grey", fontFamily: "Jost" }}>
                        {this.props.data.lang}
                        &nbsp;&nbsp;
                    </span>
                </div>
                <pre style={{ 
                    padding: 25, border: "1px solid", 
                    borderBottomRightRadius: ".35rem", 
                    borderBottomLeftRadius: ".35rem", 
                    fontSize: "87.5%", lineHeight: 1.6,
                    marginBottom: 0, maxWidth: "calc(100vw - 30px)",
                    background: this.props.dark ? "#1A1A1B" : "white",
                    borderColor: this.props.dark ? "#444" : "#dcdcdc",
                    color: this.props.dark ? "whitesmoke" : "black"
                }}>
                    <code
                        className={cx(css`
                            pre {
                                background: inherit !important;
                                padding: 0px !important;
                                border: none !important;
                                box-shadow: none !important;
                                margin: 0px !important;
                                font-size: 100% !important;
                                padding-bottom: 10px !important;
                            }
                        `)}
                    >
                        {
                            this.props.data.lang === "plain" ? this.props.data.code : (
                                <SyntaxHighlighter language={this.props.data.lang} style={this.props.dark ? dark : undefined}>
                                    {this.props.data.code}
                                </SyntaxHighlighter>
                            )
                        }
                    </code>
                </pre>
            </>
        )
    }

}