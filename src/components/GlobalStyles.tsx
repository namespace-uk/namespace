import { css } from "@emotion/css";

const GlobalStyles = {
    CENTER: css`
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0);
    `,
    CENTER_RELATIVE: css`
        position: relative;
        left: 50%;
        transform: translate(-50%, 0);
    `,
    CENTER_AS_TABLE: css`
        display: table;
        margin-left: auto;
        margin-right: auto;
    `,
    HIDE_IF_SMALL: css`
        @media(max-width: 980px) {
            display: none;
        }
    `,
    HIDE_IF_BELOW_SMALL: css`
        @media(max-width: 940px) {
            display: none;
        }
    `,
    HIDE_IF_LARGE: css`
        @media(min-width: 980px) {
            display: none;
        }
    `,
    HIDE_IF_MEDIUM: css`
        @media(max-width: 1600px) and (min-width: 980px){
            display: none;
        }
    `,
    FLAT_LINK: css`
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
    `,
    COLORLESS_LINK: css`
        &:link {
            color: black;
        }

        &:visited {
            color: black;
        }

        &:hover {
            color: black;
        }

        &:active {
            color: black;
        }
    `,
    UNSTYLED_LIST: css`
        list-style-type: none;
        padding-left: 0;
        margin-top: 10px;
    `,
    DROPDOWN_DIV: css`
        width: 10em;
        position: absolute;
        right: 0;
        display: block;
        text-align: left;
        border: 1px solid #DCDCDC;
        border-radius: 2px;
        z-index: 2;
        background: white;
        padding: 12px;
    `,
    SKELETON_FRAME_OBJECT: css`
        border-radius: .7rem;
        background: #f6f7f8;
        background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
        background-repeat: no-repeat;
        display: inline-block;

        & rect {
            fill: black;
        }
        
        -webkit-animation-duration: 1s;
        -webkit-animation-fill-mode: forwards; 
        -webkit-animation-iteration-count: infinite;
        -webkit-animation-name: placeholderShimmer;
        -webkit-animation-timing-function: linear;
    `,
    SKELETON_FRAME_OBJECT_MODIFIER_DARK: css`
        background-image: linear-gradient(to right, #e5e6e7 0%, #dcdde0 20%, #e5e6e7 40%, #e5e6e7 100%);
    `,
    guideCardIconStyles: css`
        display: table-cell;
        height: 20px;
        border-radius: 4px;
        text-align: center;
        vertical-align: middle;
        padding-bottom: 2px;
        font-family: "Roboto", sans-serif;
        transition: all 0.25s;

        &:hover {
            background: #F6F8FA;
            cursor: pointer;
        }
    `,
    topSpacerStyles: css`
        height: 10px;

        @media(min-width: 980px) {
            height: 40px
        }
    `,
    twitterBadgeStyles: css`
        &:hover {
            background: rgba(29, 161, 242, 0.4)
        }
    `,
    HIDE_FOR_MOBILE: css`
        @media screen and (max-width: 600px) {
            display: none;
            visibility: hidden;
        }
    `,
    mainColumnStyles: css`
        margin-top: 11px;
        padding: 0;
        /*min-width: calc(100vw - 922px);
        width: calc(100vw - 922px);
        max-width: calc(100vw - 922px);*/
        width: 978px;
        display: inline-block;
        padding-left: 10px;
        padding-right: 10px;

        @media(max-width: 1600px) {
            /*min-width: calc(100vw - 730px);
            width: calc(100vw - 730px);
            min-width: 800px;*/
        }

        @media(max-width: 980px) {
            min-width: 0px;
            max-width: 978px;
            width: 100%;
            display: table;
            margin-left: auto;
            margin-right: auto;
            padding-left: 10px;
            padding-right: 10px;
        }
    `,
    smallColumnStyles: css`
        width: 450px;
        max-width: 450px;
        padding: 10px;
        margin: 0;
        position: sticky;
        display: inline-block;

        @media(max-width: 1600px) {
            width: 450px;
            max-width: 450px;
        }
    `,
    customScrollbar: css`
        &::-webkit-scrollbar {
            width: 10px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: lightgrey;
            border-radius: 5px;
        }
    `,
    hiddenScrollbar: css`
        &::-webkit-scrollbar {
            display: none;
        }
    `,
    resultListStyles: css`
        padding-top: 10px;
        padding-bottom: 10px;
        display: table;
        margin-left: auto;
        margin-right: auto;
        width: 100%;
    `,
    largeColumnStyles: css`
        background: white;
        margin: 0;
        margin-bottom: 20px;
        width: 100%;
        border-radius: 10px;
    `,
    headerBoxStyles: css`
        padding: 20px;
        border-radius: .7rem;
        background: rgba(0, 0, 0, 0.06);
        font-family: 'Jost', sans-serif;
        font-weight: bold;

        & > h2 {
            font-weight: bold;
            margin-bottom: 0;

            & > img {
                vertical-align: top;
            }
        }
    `,
    guideBarTableStyles: css`
        table tr:last-child td:first-child {
            border-bottom-left-radius: 10px;
        }
        
        table tr:last-child td:last-child {
            border-bottom-right-radius: 10px;
        }
    `,
    btnCommon: css`
        font-family: Jost, sans-serif;
        font-weight: bold;
        font-size: 15pt;
        padding: 12px;
    `,
    btnLight: css`
        font-family: Jost, sans-serif;
        font-weight: bold;
        background: white;
        width: 100%;
        color: #333;
        transition: all 0.2s;
        border-color: whitesmoke;
        border-width: 3px;
        font-size: 15pt;
        margin-top: 5px;
        padding: 12px;

        &:hover, &:active {
            background: whitesmoke !important;
            color: #333 !important;
            border-color: whitesmoke;
            color: #333;
        }
    `
}

export default GlobalStyles;