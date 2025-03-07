"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { calculatePercentage, convertFileSize } from "@/lib/utils";

const chartConfig = {
  size: {
    label: "Size",
  },
  used: {
    label: "Used",
    color: "black",
  },
} satisfies ChartConfig;

export const Chart = ({ used = 0 }: { used: number }) => {
  const percentage = calculatePercentage(used);
  const chartData = [{ storage: "used", value: used, fill: "black" }];

  return (
    <Card className="flex flex-col items-center rounded-2xl bg-brand p-6 shadow-lg md:flex-row xl:p-8">
      <CardContent className="flex-1 p-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-[200px] sm:w-[220px] xl:w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={percentage + 90}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid gridType="circle" radialLines={false} stroke="none" />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) =>
                  viewBox && "cx" in viewBox && "cy" in viewBox ? (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-gray-800"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="text-3xl font-bold"
                      >
                        {percentage
                          ? percentage.toString().replace(/^0+/, "")
                          : "0"}
                        %
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="text-sm text-gray-500"
                      >
                        Space Used
                      </tspan>
                    </text>
                  ) : null
                }
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardHeader className="flex-1 px-4 py-0 sm:px-6 lg:p-4 xl:pr-6">
        <CardTitle className="text-lg font-semibold text-gray-900 md:text-center lg:text-left">
          Available Storage
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 md:text-center lg:text-left">
          {used ? convertFileSize(used) : "2GB"} / 2GB
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
