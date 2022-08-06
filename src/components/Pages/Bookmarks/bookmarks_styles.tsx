import { css } from "@emotion/css";

const Styles = {
    timeline_card_s: css`
        border: 1px solid #dcdcdc;
        background: white;
        width: 100%;
        border-radius: 0.35rem;
        padding: 30px;

        &:hover {
            border-color: #c4c4c4;
            cursor: pointer;
        }
    `,
    timeline_card_s_dark: css`
        background: #2f363d;
        border-color: #818384;
        
        &:hover {
            border-color: whitesmoke;
            cursor: pointer;
        }
    `
}

export default Styles;