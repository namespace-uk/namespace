export type TextData = {
    text: string,
    type: "markdown" | "plain" | null
};

export type KaTeXData = {
    code: string
};

export type ImageData = {
    caption: string
};

export type SectionData = {
    header: string
};

export type EmbedData = {
    link: string,
    caption?: string
};

export type CodeBlockData = {
    code: string,
    lang: string
};