import { cx, css } from "@emotion/css";

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
    `,
    button: (dark: boolean, withBorder?: boolean, variant?: 'danger') => cx(css`
        transition: all 0s;
        border-radius: .35rem;
        color: ${dark ? "whitesmoke" : "#444"};
        background: ${dark ? "#444" : "#E4E6EB"};
        &:hover, &:active {
            color: ${dark ? "whitesmoke" : "#333"} !important;
            background: ${dark ? "#555" : "#d3d5da"} !important;
            border-color: ${dark ? "#555" : "#d3d5da"} !important;
        }
        &:hover, &:active, &:focus {
            box-shadow: none !important;
            outline: none !important;
        }
    `, !!withBorder ? css`
        border: 1px solid !important;
        border-color: ${dark ? "#555" : "#cdcdcd"} !important;
    ` : css`
        border-color: ${dark ? "#444" : "#E4E6EB"} !important;
    `)
};

export default Styles;