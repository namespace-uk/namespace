import { css } from "@emotion/css";

const Styles = {
    component_d: css`
        background: var(--fg-dark);
        &, hr { border-color: var(--border-dark); }
        color: var(--color-dark);
    `,
    component_l: css`
        background: var(--fg-light);
        &:not(:hover) {
            border-color: var(--border-light) !important;
        }
        color: var(--color-light);
    `
};

export default Styles;