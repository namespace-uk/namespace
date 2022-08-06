import React from "react";

type Props = {
    dark: boolean,
    children: React.ReactNode
};

const LocationCard = (props: Props) => (
    <div style={{
        background: (props.dark ? "#1A1A1B" : "white"),
        width: "100%", height: 40, borderRadius: ".35rem",
        verticalAlign: "middle", fontFamily: "Jost, sans-serif",
        padding: 9, color: (props.dark ? "white" : "#666")
    }}>
        &nbsp;
        {props.children}
    </div>
)

export default LocationCard;