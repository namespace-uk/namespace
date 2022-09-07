import * as React from "react";

import config from "../../../../config";
import { css, cx } from "@emotion/css";
import { Image } from "react-feather";

type ImageData = {
    caption: string
};

type Props = {
    id: string,
    data: ImageData,
    dark?: boolean,
    wide?: boolean
};
type State = {
    cannotLoad: boolean
};

export default class Img extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            cannotLoad: false
        };

        this.reloadImg();
    }


    // https://stackoverflow.com/questions/36280818/how-to-convert-file-to-base64-in-javascript
    toBase64 = (file: File) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    reloadImg = async () => {
        /*const url = config.endpoints.imageBucket + this.props.id;
        await fetch(url, { cache: 'reload', mode: 'no-cors' })
        .then(res => {
            if (res.status !== 200) this.setState({ cannotLoad: true });
        })
        .then(() => document.body.querySelectorAll(`img[src='${url}']`))
        .then(x => x.forEach((img: Element) => img.setAttribute("src", url)));*/
        this.setState({ cannotLoad: false });
        // ?${new Date().getTime()}
    }

    render() {
        return (
            <div style={{ minHeight: 97 }}>
                {
                    this.state.cannotLoad ? (
                        <div
                            className={cx("text-center list-group-item-danger",
                                (this.props.dark && css`
                                    background: #343434;
                                    color: whitesmoke;
                                `),
                                (this.props.wide && css`
                                    @media(min-width: 768px) {
                                        margin-top: 15px;
                                        margin-bottom: 15px;
                                    }
                                `)
                            )}
                            style={{ borderRadius: ".35rem", padding: 35.5, fontFamily: "Jost" }}
                        >
                            <Image size={17} style={{ position: "relative", bottom: 2 }} />
                            &nbsp;
                            Could not load Image
                        </div>
                    ) : (
                        <img
                            style={{
                                border: this.props.dark ? "1px solid #343434" : "1px solid #dcdcdc",
                                borderRadius: ".35rem"
                            }}
                            className={cx(this.props.wide && css`
                                @media(min-width: 768px) {
                                    width: 120%;
                                    position: relative;
                                    left: -10%;
                                    margin-bottom: 10px;
                                }
                            `, css`width: 100%`)}
                            onLoad={() => this.setState({ cannotLoad: false })}
                            onError={() => this.setState({ cannotLoad: true })}
                            alt={this.props.data.caption || "An undescribed image"}
                            src={config.endpoints.imageBucket(this.props.id)}
                            loading="lazy"
                        />
                    )
                }
                {
                    this.props.data.caption && (
                        <div style={{ display: "block", textAlign: "center", fontFamily: "Jost", padding: 5, color: this.props.dark ? "whitesmoke" : "grey", fontSize: "12pt" }}>
                            {this.props.data.caption}
                        </div>
                    )
                }
            </div>
        )
    }

}