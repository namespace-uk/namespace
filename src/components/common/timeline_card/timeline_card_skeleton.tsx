import * as React from "react";
import Styles from "./styles";
import Skeleton from "react-loading-skeleton";
import { cx } from "@emotion/css";

const timeline_card : React.FC<{ dark?: boolean}> = props => (
    <div className={cx( Styles.timeline_card_s, (props.dark ? Styles.timeline_card_s_dark : null) )}>
        <h2><Skeleton width={380}/></h2>
        <h6><Skeleton width={130}/></h6>
        <div style={{ height: 15 }}/>
        <p><Skeleton count={2}/></p>
        <hr style={{ borderColor: props.dark ? "#444" : "#dcdcdc" }}/>
        <div style={{ height: 25, background: (props.dark ? "#1A1A1B" : "white") }}>
            <span style={{ padding: 3, fontSize: "15pt", fontWeight: "bold" }}>
                <span style={{ position: "relative", bottom: 8 }}>
                <Skeleton style={{ width: 24, height: 24, borderRadius: "50%" }}/>
                    &nbsp;&nbsp;
                </span>
                <small style={{ position: "relative", bottom: 7 }}><Skeleton width={100}/></small>
                &nbsp;&nbsp;
            </span>
        </div>
    </div>
)

export default timeline_card;