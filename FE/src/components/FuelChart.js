import React from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

export default function FuelChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="level"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 8 }}
                    name="Mực xăng"
                    unit="%"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}