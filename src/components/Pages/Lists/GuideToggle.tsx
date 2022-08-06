import { cx, css } from "@emotion/css";
import { CheckCircle } from "react-feather";
import CommonType from "../../common/types";
import { PulseLoader } from "react-spinners";

type Guide = {
    id: string,
    blocks: any[],
    header: string,
    description: string,
    timestamp: Date,
    user: string,
    views: number,
    likes: number | null,
    isPrivate: boolean
};

const Styles = {
    timeline_card_s: css`
        padding: 20px 20px 15px 20px;
        border: 1px solid #dcdcdc;
        background: white;
        width: 100%;
        border-radius: 0.35rem;

        &:hover {
            border-color: #c4c4c4;
            cursor: pointer;
        }
    `,
    timeline_card_s_dark: css`
        padding: 20px 20px 15px 20px;
        background: #1A1A1B;
        color: #DDD;
        border-color: #444;

        hr {
            border-color: #444;
        }
        
        &:hover {
            border-color: whitesmoke;
            cursor: pointer;
        }
    `,
    active_card: css`
        &, &:hover { border-color: var(--success); }
        h4, h6 {
            opacity: 0.5;
        }
        border-width: 3px;
        padding: 18px 18px 13px 18px;
    `,
    loading_card: css`
        &, &:hover { border-color: var(--primary); }
        h4, h6 {
            opacity: 0.5;
        }
        border-width: 3px;
        padding: 18px 18px 13px 18px;
    `,
    icon_s: css`
        float: right;
        z-index: 2;
        position: relative;
        bottom: 2px;
        left: 2px;
    `
};

export enum ToggleState {
    OFF,
    ON,
    LOADING
}

const GuideToggle: React.FC<{
    guide: Guide,
    list: CommonType.List,
    dark: boolean,
    toggle: (g: CommonType.Guide, ts: ToggleState) => Promise<void>,
    state: ToggleState
}> = props => {
    return (
        <div
            className={cx(
                Styles.timeline_card_s,
                (props.dark && Styles.timeline_card_s_dark),
                (props.state === ToggleState.ON && Styles.active_card),
                (props.state === ToggleState.LOADING && Styles.loading_card)
            )}
            style={{ transition: "all .2s" }}
            onClick={async () => {
                const list = props.list;

                const index = list.guides.indexOf(props.guide.id);
                if (index !== -1) list.guides.splice(index, 1);
                else list.guides.push(props.guide.id);

                const newState = props.state === ToggleState.ON ? ToggleState.OFF : ToggleState.ON;

                await props.toggle(props.guide, ToggleState.LOADING);

                fetch("https://iv6csj22wy5kzbrrcmpljvkdqy0sthwb.lambda-url.eu-west-1.on.aws/", {
                    method: "POST",
                    body: JSON.stringify(props.list)
                })
                    .then(res => res.json())
                    .then(_ => props.toggle(props.guide, newState));
            }}
        >
            {
                props.state === ToggleState.ON && (
                    <CheckCircle
                        color="var(--success)"
                        className={cx(Styles.icon_s)}
                    />
                )
            }
            {
                props.state === ToggleState.LOADING && (
                    <span className={cx(Styles.icon_s)}>
                        <PulseLoader color="var(--primary)" size={8} margin={5} />
                    </span>
                )
            }
            <h4 style={{ fontWeight: "bold" }}>{props.guide.header}</h4>
            <h6 style={{ color: "gray" }}>{(new Date(props.guide.timestamp)).toDateString()}</h6>
        </div>
    )
}

export default GuideToggle;