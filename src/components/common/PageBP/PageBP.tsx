import * as React from "react";

import Styles from "./BPStyles";

import UserHandler from "../UserHandler";
import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";
import { cx } from "@emotion/css";
import { useParams } from "react-router-dom";

export type BPState = {
    dark: boolean,
    user: CognitoUser | null
};

const pair = (l: string, d: string, s?: string) => (dark: boolean) => cx((dark ? d : l), s);

export const inAuthContext = (f: (s: CognitoUserSession) => void, user: CognitoUser): void => {
    user.getSession(async (error: Error | null, session: CognitoUserSession | null) => {
        if (error) return;
        else f(session!);
    })
}

export const withParams = (Component: any) => (props: any) => {
    const params = useParams();
    return <Component params={params} {...props} />;
  };

export default abstract class PageBP<P, S extends BPState> extends React.Component<P, S> {

    private userHandler = new UserHandler();
    protected localStorage = PageBP.setLocalStorage();
    static readonly Styles = {
        component: pair(Styles.component_l, Styles.component_d)
    };

    static setLocalStorage = () => {
        let storage = (localStorage ? localStorage : null);
    
        try {
            if (storage) {
                // verify if posible saving in the current storage
                storage.setItem('test_key', 'test_value');
            }
        } catch (err: any) {
            if (err.name === "NS_ERROR_FILE_CORRUPTED") {
                storage = sessionStorage ? sessionStorage : null;//set the new storage if fails
            }
        }
        return storage;
    }

    setDarkMode = async (dark: boolean) => this.setState({ dark: dark });

    toggleDarkMode = async () => {
        const current = this.localStorage!.getItem("darkmode");
        const isDark = ["false", null].includes(current);
        this.localStorage!.setItem("darkmode", isDark.toString());
        return isDark;
    }

    defaults = () => ({
        user: this.userHandler.getUser(),
        dark: this.localStorage!.getItem("darkmode") === "true"
    });

    abstract init(): void

}