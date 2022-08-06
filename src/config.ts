const api_root = process.env.REACT_APP_API_ROOT;
if (!api_root || typeof api_root !== "string") 
    throw new Error("Missing env variable API_ROOT");
const path = (endpoint: string) => api_root.concat(endpoint);

const config = {
    "ns_id": "global",
    "version": "0.3L",
    "endpoints": {
        // "createGuide": "https://gaz7xuxhtw672zlxrzi3j3l62y0euhyo.lambda-url.eu-west-1.on.aws/",
        "createGuide": path(`/guide/create`),
        // "getTopGuides": "https://zryykeueiirl364hgv235kuw4a0qfjjv.lambda-url.eu-west-1.on.aws/",
        "getTopGuides": path(`/guide/top`),
        // "getProfile": "https://d256a5wnnu6ki7jplvtcylgggu0gcrol.lambda-url.eu-west-1.on.aws/",
        "getProfile": path(`/profile`),
        // "getFullProfile": "https://mc7yteateqpngxnm4gjf2pinbu0duwvu.lambda-url.eu-west-1.on.aws/",
        // (deprecated)
        // "updateUserProfile": "https://xsjkmjehiu7qkykgbv3zwvxcce0dihdz.lambda-url.eu-west-1.on.aws/",
        "updateUserProfile": path(`/profile/update`),
        // "confirmUser": "https://ctudusblrirmpajcmrgbw7b3bq0ywpnj.lambda-url.eu-west-1.on.aws/",
        "confirmUser": path(`/user/confirm`),
        // "search": "https://2bfpbda7g32lqz2flwzdbphrfm0errox.lambda-url.eu-west-1.on.aws/",
        "search": (query: string) => path(`/guide/search/${query}`),
        // "getBookmarks": "https://vkv2tpo7wdnk65t35cji23lode0sfors.lambda-url.eu-west-1.on.aws/",
        "getBookmarks": path(`/profile/bookmarks`),
        // "getGuide": "https://klgzgxqiqmdnklle6tdajiryey0arowc.lambda-url.eu-west-1.on.aws/",
        "getGuide": (id: string) => path(`/guide/${id}`),
        // "deleteGuide": "https://r5s2vkmvv7erlyzaidksadncqe0fyqmf.lambda-url.eu-west-1.on.aws/",
        "deleteGuide": (id: string) => path(`/guide/${id}`),
        // "getAllGuides": "https://mnp3mmj6rbkqspjx5rw6mhmi6m0ghrzn.lambda-url.eu-west-1.on.aws/",
        "getAllGuides": path("/guide/all"),
        // "createList": "https://47uqyzqqrreo4uszgp72sp5vai0bumbo.lambda-url.eu-west-1.on.aws/",
        "createList": `${api_root}/list/create`,
        "getList": (id: string) => path(`/list/${id}`),
        "deleteList": (id: string) => path(`/list/${id}`),
        // "updateList": "https://iv6csj22wy5kzbrrcmpljvkdqy0sthwb.lambda-url.eu-west-1.on.aws/",
        "updateList": path("/list/update"),
        // "getLists": "https://3qpw7rdkvpr5ode3veex7hccwi0yfokb.lambda-url.eu-west-1.on.aws/",
        "getLists": path("/list/user"),
        // "updateGuide": "https://5kpc5673t4dbh745mrhua6pi2q0gvvza.lambda-url.eu-west-1.on.aws/",
        "updateGuide": path("/guide/update"),
        // "uploadImage": "https://ss3yyaqnziwbh45esw736juj5a0vuvgj.lambda-url.eu-west-1.on.aws/",
        "uploadImage": path("/image/upload"),
        "imageBucket": (id: string) => path(`/image/${id}`)
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