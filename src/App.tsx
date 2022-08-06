import * as React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import LoginPage from "./components/Pages/auth_login";
import SignupPage from "./components/Pages/auth_signup";

import Bookmarks from "./components/Pages/Bookmarks/bookmarks";
import Editor from "./components/Pages/editor/editor";
import Guide from "./components/Pages/guide/guide";
import Home from "./components/Pages/Home/Home";
import Preferences from "./components/Pages/preferences/preferences";
import Profile from "./components/Pages/profile/profile";
import SearchPage from "./components/Pages/search/search";
import UnknownRoutePage from "./components/Pages/unknown_route_page";
import Lists from "./components/Pages/Lists/Lists";
import AccountCreationPage from "./components/Pages/account_creation/account_creation_page";
import GuideRedir from "./components/Pages/guide/guide_redirect";
import SpaceNavigator from "./components/Pages/space_navigator/SpaceNavigator";
import List from "./components/Pages/List";
import { CookiePolicy, PrivacyPolicy, TermsOfService } from "./components/Pages/docs/Docs";

type Props = {};
type State = {};

export default class App extends React.Component<Props, State> {
    render() {
        return (
            <BrowserRouter forceRefresh>
                <Switch>
                    <Route path="/"                         component={ Home }                      exact/>
                    <Route path="/bookmarks"                component={ Bookmarks }                 exact/>
                {/*}    <Route path="/chat"                     component={ Chat }                      exact/> */}
                    <Route path="/search/:query"            component={ SearchPage }                     />                
                    <Route path="/g/:id"                    component={ Guide }                          />
                    <Route path="/gr/:id"                   component={ GuideRedir }                exact/>
                    <Route path="/e/:id"                    component={ Editor }                         />
                    <Route path="/list/:id"                 component={ List }                      exact/>
                    <Route path="/ac/:id"                   component={ AccountCreationPage }       exact/>
                    <Route path="/spaces"                   component={ SpaceNavigator }            exact/>
                    <Route path="/user/:username"           component={ Profile }                  />
                    <Route path="/preferences"              component={ Preferences }               exact/>
                    <Route path="/auth/login"               component={ LoginPage }                 exact/>
                    <Route path="/auth/signup"              component={ SignupPage }                exact/>
                    <Route path="/lists"                    component={ Lists }                     exact/>    
                    <Route path="/terms-of-service"         component={ TermsOfService }            exact/>
                    <Route path="/privacy-policy"           component={ PrivacyPolicy }             exact/>
                    <Route path="/cookie-policy"            component={ CookiePolicy }              exact/>
                {/* <Route                                  component={ ErrorPage }                      /> */}
                    <Route path="*"                         component={ UnknownRoutePage }               />
                </Switch>
            </BrowserRouter>
        )
    }
}

