import { css } from "@emotion/css";

const Styles = {
    small_col_s: css`
        @media(max-width: 768px) {
            display: none;
        }
    `,
    flat_link: css`
        &:link {
            color: black;
            text-decoration:none;
        }
        &:visited {
            color: black;
            text-decoration:none;
        }
        &:hover {
            color: black;
            text-decoration:none;
        }
        &:active {
            color: black;
            text-decoration:none;
        }
    `
}

export default Styles;