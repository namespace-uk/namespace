import { css } from "@emotion/css";

const Styles = {
    add_block_btn_s: css`
        padding: 30px;
        border-radius: .35rem;
        border: 3px solid whitesmoke;
        text-align: center;
        background: white;
        color: #DCDCDC;

        &:hover {
            background: whitesmoke;
            color: #666;
            cursor: pointer;
        }
    `,
    thumbnail_s: css`
        &:hover {
            opacity: 0.9;
            cursor: pointer;
        }
    `,
    tag_s: css`
        background: whitesmoke;
        padding: 5px 14px;
        margin-right: 5px;
        border-radius: 20px;
        font-family: Jost, sans-serif;
        border: 1px solid #dcdcdc;
        &:hover{ cursor: pointer; background: #efefef; }
        white-space: nowrap;
    `
};

export default Styles;