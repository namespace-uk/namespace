import * as React from "react";
import { GitHub } from "react-feather";
import { Link } from "react-router-dom";
import CStyles from "../common/common_styles";

export const Footnote: React.FC<{ dark?: boolean }> = props => (
    <div
        style={{
            fontFamily: "Jost",
            color: props.dark ? "#666" : "#999",
            padding: "20px 15px",
            display: "flex", gap: "5px 15px",
            flexWrap: "wrap"
        }}>
        {
            [
                ["Terms of Service", "terms-of-service"],
                ["Privacy Policy", "privacy-policy"],
                ["Cookie Policy", "cookie-policy"]
            ].map(x => (
                <Link key={x[2]} to={`/${x[1]}`} style={{ textDecoration: "underline", color: "inherit" }}>
                    <div style={{ whiteSpace: "nowrap", fontSize: ".8rem" }}>
                        {x[0]}
                    </div>
                </Link>
            ))
        }
        <div key="gh-link" style={{ whiteSpace: "nowrap", fontSize: ".8rem" }}>
            <GitHub size={12} style={{ marginBottom: 2 }} />
            &nbsp;
            <a
                className={CStyles.flat_link}
                href="https://github.com/namespace-uk/namespace"
                style={{ color: "inherit", textDecoration: "underline" }}
            >GitHub</a>
        </div>
        <div key="copyright" style={{ whiteSpace: "nowrap", fontSize: ".8rem" }}>
            © Musab Guma'a 2022
        </div>
    </div>
);