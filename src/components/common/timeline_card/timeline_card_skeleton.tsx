import * as React from "react";
import Skeleton from "react-loading-skeleton";
import { cx, css } from "@emotion/css";

const Styles = {
    timeline_card_s: css`
        border: 1px solid #dcdcdc;
        background: white;
        width: 100%;
        border-radius: .35rem;
    `,
    timeline_card_s_dark: css`
        background: #161616;
        border-color: #343434;

        hr {
            border-color: #999;
        }

        .react-loading-skeleton {
            background-color: #333;
        }
    `
};

// padding: 26px 30px 25px 30px;

const timeline_card: React.FC<{ dark?: boolean }> = props => (
    <div className={cx(Styles.timeline_card_s, (props.dark ? Styles.timeline_card_s_dark : null))}>
        <div style={{ padding: "26px 30px 25px 30px" }}>
            <h2><Skeleton width={380} /></h2>
            <h6><Skeleton width={130} /></h6>
            <div style={{ height: 15 }} />
            <p style={{ margin: 0 }}><Skeleton count={2} /></p>
        </div>
        <div
            style={{
                background: (props.dark ? "#161616" : "white"),
                padding: "8px 15px",
                borderRadius: "0px 0px .35rem .35rem",
                borderTop: "1px solid",
                borderColor: props.dark ? "#343434" : "#dcdcdc"
            }}>
            <span style={{ padding: 3, fontSize: "15pt", fontWeight: "bold" }}>
                <span style={{ position: "relative", bottom: 3 }}>
                    <Skeleton style={{ width: 24, height: 24, borderRadius: "50%" }} />
                    &nbsp;&nbsp;
                </span>
                <small style={{ position: "relative", bottom: 2 }}><Skeleton width={100} /></small>
                &nbsp;&nbsp;
            </span>
        </div>
    </div>
)

export default timeline_card;