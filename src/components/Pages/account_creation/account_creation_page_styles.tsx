import { css } from "@emotion/css";

const Styles = {
    main_box_s: css`
        background: white;
        border-radius: .35rem;
        padding: 30px;
        border: 1px solid #dcdcdc;
        font-family: Jost, sans-serif;
    `,
    pfp_choice_box_s: css`
        border: 1px solid #dcdcdc;
        border-radius: .35rem;
        padding: 30px;
        transition: all .5s;
        height: 400px;

        &:hover {
            border-color: #666;
            cursor: pointer;
        }
    `
};

export default Styles;