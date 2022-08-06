import SimplePageBP from "../../common/SimplePageBP/SimplePageBP";

export const TermsOfService : React.FC<{}> = props => (
    <SimplePageBP header="Terms of Service" updated={new Date()}>
        (None as of yet)
    </SimplePageBP>
);

export const PrivacyPolicy : React.FC<{}> = props => (
    <SimplePageBP header="Privacy Policy" updated={new Date()}>
        (None as of yet)
    </SimplePageBP>
);

export const CookiePolicy : React.FC<{}> = props => (
    <SimplePageBP header="Cookie Policy" updated={new Date()}>
        (None as of yet)
    </SimplePageBP>
);