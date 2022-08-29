const api_root = process.env.REACT_APP_API_ROOT;
if (!api_root || typeof api_root !== "string") 
    throw new Error("Missing env variable API_ROOT");
const path = (endpoint: string) => api_root.concat(endpoint);

const config = {
    "ns_id": "global",
    "version": "0.3L",
    "endpoints": {
        "createGuide": path("/guide/create"),
        "getTopGuides": path("/guide/top"),
        "getProfile": path("/profile"),
        "updateUserProfile": path("/profile/update"),
        "confirmUser": path("/user/confirm"),
        "search": (query: string) => path(`/guide/search/${query}`),
        "getBookmarks": path("/profile/bookmarks"),
        "getLikes": path("/profile/likes"),
        "getGuide": (id: string) => path(`/guide/${id}`),
        "deleteGuide": (id: string) => path(`/guide/${id}`),
        "likeGuide": path("/guide/like"),
        "getAllGuides": path("/guide/all"),
        "createList": `${api_root}/list/create`,
        "getList": (id: string) => path(`/list/${id}`),
        "deleteList": (id: string) => path(`/list/${id}`),
        "updateList": path("/list/update"),
        "getLists": path("/list/user"),
        "updateGuide": path("/guide/update"),
        "uploadImage": path("/image/upload"),
        "imageBucket": (id: string) => path(`/image/${id}`),
        "getSpaces": "https://z5ermsmvlysvfwh2vg7xtyvaom0mqfdr.lambda-url.eu-west-1.on.aws/"
    },
    "api_root": api_root,
    "cognito_pool_data": {
        UserPoolId: process.env.REACT_APP_USER_POOL_ID!,
        ClientId: process.env.REACT_APP_CLIENT_ID!
    },
    "typesense_search_options": {
        nodes: [{
            'host': process.env.REACT_APP_TYPESENSE_SEARCH_HOST!,
            'port': 443,
            'protocol': 'https',
        }],
        apiKey: process.env.REACT_APP_TYPESENSE_API_KEY!
    }
}

export default config;