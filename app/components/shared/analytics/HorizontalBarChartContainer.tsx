// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import React, { useState } from "react";
// import CustomCard from "../cards/CustomCard";
// import Heading2 from "../headings/h2";
// import MessageCard from "../cards/MessageCard";

// interface HorizontalBarChartContainerProps<T> {
//   data: T[];
//   xKey: keyof T;
//   barKeys: string[];
//   title: string;
//   tooltipFormatter?: (value: number) => string;
//   valueFormatter?: (value: number) => string;
//   emptyDescription?: string;
// }

// const HorizontalBarChartContainer = <T extends Record<string, any>>({
//   data,
//   xKey,
//   barKeys,
//   title,
//   tooltipFormatter = (value: number) => `${value}`,
//   valueFormatter = (value: number) => `${value}`,
//   emptyDescription = "No data available for this time period.",
// }: HorizontalBarChartContainerProps<T>) => {
//   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

//   const CustomBar = (props: any) => {
//     const { x, y, width, height, index, fill } = props;
//     return (
//       <g>
//         <rect
//           x={x}
//           y={y}
//           width={width}
//           height={height}
//           rx={4}
//           ry={4}
//           fill={fill}
//           cursor="pointer"
//           onClick={() => setSelectedIndex(index)}
//           style={{ transition: "none" }}
//         />
//       </g>
//     );
//   };

//   if (data.length === 0) {
//     return (
//       <MessageCard
//         showButton={false}
//         title={title}
//         description={emptyDescription}
//       />
//     );
//   }

//   return (
//     <CustomCard className="p-4">
//       {title && <Heading2>{title}</Heading2>}

//       <ResponsiveContainer width="100%" height={400}>
//         <BarChart
//           data={data}
//           layout="vertical"
//           margin={{ top: 20, right: 20, left: 40, bottom: 20 }}
//         >
//           <XAxis
//             type="number"
//             tick={{ fontSize: 12, fill: "#f3f4f6" }}
//             tickFormatter={valueFormatter}
//           />
//           <YAxis
//             type="category"
//             dataKey={xKey as string}
//             tick={{ fontSize: 12, fill: "#f3f4f6" }}
//           />
//           <Tooltip
//             contentStyle={{
//               backgroundColor: "#1f2937",
//               borderRadius: "0.375rem",
//             }}
//             labelStyle={{ color: "#f3f4f6" }}
//             formatter={(value) => tooltipFormatter(Number(value))}
//             cursor={{ fill: "#1f2937" }}
//           />
//           <Legend
//             verticalAlign="top"
//             iconType="circle"
//             wrapperStyle={{
//               color: "#f3f4f6",
//               fontSize: "14px",
//               paddingBottom: "14px",
//             }}
//           />
//           {barKeys.map((key) => (
//             <Bar
//               key={String(key)}
//               dataKey={key as string}
//               name={
//                 key === "male"
//                   ? "Male"
//                   : key === "female"
//                     ? "Female"
//                     : String(key)
//               }
//               fill={
//                 key === "male"
//                   ? "#3B82F6"
//                   : key === "female"
//                     ? "#EC4899"
//                     : "#10B981"
//               }
//               shape={<CustomBar />}
//               barSize={24}
//               isAnimationActive={false}
//               activeBar={false}
//             />
//           ))}
//         </BarChart>
//       </ResponsiveContainer>
//     </CustomCard>
//   );
// };

// export default HorizontalBarChartContainer;

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import React, { useMemo, useState } from "react";
import CustomCard from "../cards/CustomCard";
import Heading2 from "../headings/h2";
import MessageCard from "../cards/MessageCard";

interface HorizontalBarChartContainerProps<T> {
  data: T[];
  xKey: keyof T;
  barKeys: string[];
  title: string;
  tooltipFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  emptyDescription?: string;
}

// --- helpers: stable pseudo-random color per key ---
function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
function colorForKey(key: string) {
  const hue = hashString(key) % 360;
  // tweak S/L for good contrast on dark UI
  return `hsl(${hue} 70% 45%)`;
}

const HorizontalBarChartContainer = <T extends Record<string, any>>({
  data,
  xKey,
  barKeys,
  title,
  tooltipFormatter = (value: number) => `${value}`,
  valueFormatter = (value: number) => `${value}`,
  emptyDescription = "No data available for this time period.",
}: HorizontalBarChartContainerProps<T>) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const key of barKeys) {
      map[key] = colorForKey(String(key));
    }
    return map;
  }, [barKeys]);

  const CustomBar = (props: any) => {
    const { x, y, width, height, index, fill } = props;
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
          style={{ transition: "none" }}
        />
      </g>
    );
  };

  if (data.length === 0) {
    return (
      <MessageCard
        showButton={false}
        title={title}
        description={emptyDescription}
      />
    );
  }

  return (
    <CustomCard className="p-4">
      {title && <Heading2>{title}</Heading2>}

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 40, bottom: 20 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "#f3f4f6" }}
            tickFormatter={valueFormatter}
          />
          <YAxis
            type="category"
            dataKey={xKey as string}
            tick={{ fontSize: 12, fill: "#f3f4f6" }}
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
          <Legend
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{
              color: "#f3f4f6",
              fontSize: "14px",
              paddingBottom: "14px",
            }}
          />
          {barKeys.map((key) => (
            <Bar
              key={String(key)}
              dataKey={key as string}
              name={String(key)}
              fill={colorMap[String(key)]} // <-- unique color per ticket type
              shape={<CustomBar />}
              barSize={24}
              isAnimationActive={false}
              activeBar={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </CustomCard>
  );
};

export default HorizontalBarChartContainer;
