import * as React from "react";
import { Link } from "react-router-dom";

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
        <div key="copyright" style={{ whiteSpace: "nowrap", fontSize: ".8rem" }}>
            © Musab Guma'a 2022
        </div>
    </div>
);