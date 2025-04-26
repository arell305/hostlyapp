import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import React, { useState } from "react";
import CustomCard from "../cards/CustomCard";
import Heading2 from "../headings/h2";

interface BarChartContainerProps<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  barLabel?: string;
  title?: string;
  tooltipFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
}

const BarChartContainer = <T extends Record<string, any>>({
  data,
  xKey,
  yKey,
  barLabel,
  title,
  tooltipFormatter = (value: number) => `$${value.toFixed(2)}`,
  valueFormatter = (value: number) => `$${value.toFixed(2)}`,
}: BarChartContainerProps<T>) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const CustomBar = (props: any) => {
    const { x, y, width, height, index, fill } = props;
    const isSelected = selectedIndex === index;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          ry={4}
          fill={fill}
          cursor="pointer"
          onClick={() => setSelectedIndex(index)}
          style={{
            transition: "none",
          }}
        />
      </g>
    );
  };

  return (
    <CustomCard className=" p-4">
      {title && <Heading2>{title}</Heading2>}

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis
            dataKey={xKey as string}
            tick={{ fontSize: 12, fill: "#f3f4f6" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#f3f4f6" }}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              borderRadius: "0.375rem",
            }}
            labelStyle={{ color: "#f3f4f6" }}
            formatter={(value) => tooltipFormatter(Number(value))}
            cursor={{ fill: "#1f2937" }}
          />
          <Bar
            dataKey={yKey as string}
            name={barLabel}
            fill="#3B82F6"
            shape={<CustomBar />}
            barSize={30}
            isAnimationActive={false}
            activeBar={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </CustomCard>
  );
};

export default BarChartContainer;
