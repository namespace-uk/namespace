import { css } from "@emotion/css";

const Styles = {
    profile_card: css`
        width: 100%;
        max-width: 400px;
        height: 305px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 2px 4px rgba(0,0,0,0.25);
        transition: all 0.35s;
    `,
    profile_card_skeleton_s: css`
        opacity: .3;
        transition: all .25s;
        border: 1px solid #dcdcdc;

        &:hover {
            opacity: 1;
            cursor: pointer;
            transform: scale(1.04);
        }
    `,
    profile_picture_image: css`
        max-width: 76px;
        border-radius: 50%;
        border: 3px solid white;
        transition: border 0.15s ease-in-out;
        &:hover {
            border: 0px solid white;
            cursor: pointer;
        }
    `,
    social_icon_button: css`
        width: 15%;
        height: 32px;
        background: white;
        color: rgba(0,0,0,0.8);
        border-radius: 5px;
        margin: 8px 8px 0px 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #dcdcdc;
        &:hover { cursor: pointer; border-color: #c4c4c4; }
    `
}

export default Styles;