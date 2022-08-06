import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import config from "../../config";

export default class UserHandler {
    private user: CognitoUser | null;

    constructor() {
        const userPool = new CognitoUserPool(config.cognito_pool_data);
        this.user = userPool.getCurrentUser();
    }

    getUser = () => this.user;
}