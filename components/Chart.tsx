"use client";

import React, { useMemo } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { convertFileSize } from "@/lib/utils";

type StorageData = {
  used: number;
  total?: number;
  warningThreshold?: number;
  dangerThreshold?: number;
};

export const Chart = ({
  used = 0,
  total = 2000000000, // Default 2GB in bytes
  warningThreshold = 0.7, // 70%
  dangerThreshold = 0.9, // 90%
}: StorageData) => {
  const percentage = Math.round((used / total) * 100);
  const remaining = total - used;

  // Determine color based on usage thresholds
  const getFillColor = () => {
    const usageRatio = used / total;
    if (usageRatio >= dangerThreshold) return "#ef4444"; // red-500
    if (usageRatio >= warningThreshold) return "#f59e0b"; // amber-500
    return "#6366f1"; // indigo-500
  };

  const chartData = useMemo(
    () => [
      {
        name: "Used",
        value: percentage,
        fill: getFillColor(),
      },
      {
        name: "Remaining",
        value: 100 - percentage,
        fill: "#e2e8f0", // gray-200
      },
    ],
    [percentage]
  );

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Storage Overview
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {convertFileSize(used)} used of {convertFileSize(total)}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={8}
                animationDuration={1500}
              />

              {/* Center text */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold"
                fill={getFillColor()}
              >
                {percentage}%
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm"
                fill="#64748b" // gray-500
              >
                Used
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-500">Available</p>
            <p className="text-lg font-semibold text-gray-900">
              {convertFileSize(remaining)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">
              {convertFileSize(total)}
            </p>
          </div>
        </div>

        {percentage >= warningThreshold * 100 && (
          <div
            className={`mt-4 rounded-lg p-3 ${
              percentage >= dangerThreshold * 100
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <p className="text-sm font-medium">
              {percentage >= dangerThreshold * 100
                ? "⚠️ Critical: Storage almost full"
                : "⚠️ Warning: Storage reaching limit"}
            </p>
            <p className="text-xs mt-1">
              {percentage >= dangerThreshold * 100
                ? "Please free up space or upgrade your storage plan"
                : "Consider cleaning up unused files"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
