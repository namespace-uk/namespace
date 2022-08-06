import { css } from "@emotion/css";

const Styles = {
    timeline_card_s: css`
        border: 1px solid #dcdcdc;
        background: white;
        width: 100%;
        border-radius: .35rem;
        padding: 26px 30px 25px 30px;

        &:hover {
            border-color: #c4c4c4;
            cursor: pointer;
        }
    `,
    timeline_card_s_dark: css`
        background: #1A1A1B;
        border-color: #444;

        hr {
            border-color: #999;
        }

        .react-loading-skeleton {
            background-color: #333;
        }
    `
}

export default Styles;