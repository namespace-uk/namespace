namespace CommonType {

    export type Guide = {
        id: string,
        blocks: any[],
        header: string,
        description: string,
        timestamp: Date,
        user: string,
        views: number,
        isPrivate: boolean,
        likes: number | null
    }

    export type List = {
        id: string,
        header: string,
        description: string,
        user: string,
        timestamp: string,
        guides: string[],
        isPrivate?: boolean
    };

    export type Block = {
        id: string,
        type: string,
        data: Object
    }

    export type ProfileData = {
        username: string,
        description: string,
        location: string,
        joined: string | null
    }

}

export default CommonType;