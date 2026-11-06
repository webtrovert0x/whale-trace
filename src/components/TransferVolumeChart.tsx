"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { VolumeDataPoint } from "@/types";
import { BarChart3 } from "lucide-react";

interface TransferVolumeChartProps {
  data: VolumeDataPoint[];
  tokenSymbol: string;
}

export function TransferVolumeChart({
  data,
  tokenSymbol,
}: TransferVolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-800">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-white">Transfer Volume Charts</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-xs text-slate-500">
          No transfer volume data to chart for this query.
        </div>
      </div>
    );
  }

  const totalVolume = data.reduce((acc, curr) => acc + curr.volume, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <div>
            <h3 className="text-sm font-semibold text-white">Transfer Volume Charts</h3>
            <p className="text-[11px] text-slate-400">
              Distribution of whale volume across blocks
            </p>
          </div>
        </div>
        <div className="text-xs bg-slate-950 border border-slate-800 px-3 py-1 rounded text-slate-300">
          Total Chart Volume:{" "}
          <span className="font-bold text-white">
            {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tokenSymbol}
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="blockOrTime"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tickFormatter={(val) =>
                val >= 1000000
                  ? `${(val / 1000000).toFixed(1)}M`
                  : val >= 1000
                  ? `${(val / 1000).toFixed(0)}k`
                  : val
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as VolumeDataPoint;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-lg text-xs font-mono">
                      <div className="font-semibold text-white mb-1">
                        Block #{item.blockNumber}
                      </div>
                      <div className="text-blue-400">
                        Volume: {item.volume.toLocaleString()} {tokenSymbol}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Transfers: {item.count}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Flat solid color bar without gradient */}
            <Bar dataKey="volume" fill="#2563eb" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

