import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsChartsProps {
  durationTimeSeries: Array<{
    timestamp: string;
    avgDuration: number;
    count: number;
  }>;
  statusCodeTimeSeries: Array<{
    timestamp: string;
    statusCode: string;
    count: number;
  }>;
}

type GroupedStatusCode = {
  timestamp: string;
  [key: string]: string | number;
};

export function AnalyticsCharts({
  durationTimeSeries,
  statusCodeTimeSeries,
}: AnalyticsChartsProps) {
  // Group status codes by timestamp
  const groupedStatusCodes = statusCodeTimeSeries.reduce<GroupedStatusCode[]>(
    (acc, curr) => {
      const existing = acc.find((item) => item.timestamp === curr.timestamp);
      if (existing) {
        existing[curr.statusCode] = curr.count;
      } else {
        const newEntry: GroupedStatusCode = {
          timestamp: curr.timestamp,
          [curr.statusCode]: curr.count,
        };
        acc.push(newEntry);
      }
      return acc;
    },
    [],
  );

  // Get unique status codes for the bar chart
  const uniqueStatusCodes = Array.from(
    new Set(statusCodeTimeSeries.map((item) => item.statusCode)),
  );

  const formatTimestamp = (timestamp: string) => {
    // Parse the UTC timestamp and convert to local time
    const date = new Date(`${timestamp}Z`); // Append Z to treat as UTC
    return date.toLocaleTimeString();
  };

  const formatFullTimestamp = (timestamp: string) => {
    const date = new Date(`${timestamp}Z`); // Append Z to treat as UTC
    return date.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-3 border border-amber-200 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">
          {formatFullTimestamp(label)}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}{" "}
            {entry.dataKey === "avgDuration" ? "ms" : " requests"}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Duration Chart */}
      <div className="border border-amber-300 p-4">
        <h3 className="text-lg font-semibold mb-4">Response Times</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={durationTimeSeries}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTimestamp}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => `${Math.round(value)}ms`}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="avgDuration"
                stroke="#d97706"
                strokeWidth={2}
                dot={false}
                name="Average Duration"
                activeDot={{ r: 4, stroke: "#d97706", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Code Chart */}
      <div className="border border-amber-300 p-4">
        <h3 className="text-lg font-semibold mb-4">
          Request Count (by Status Code)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={groupedStatusCodes}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTimestamp}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => `${value}`}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              {uniqueStatusCodes.map((statusCode) => (
                <Bar
                  key={statusCode}
                  dataKey={statusCode}
                  fill={getStatusCodeColor(statusCode)}
                  stackId="status"
                  name={`Status ${statusCode}`}
                  radius={[0, 0, 0, 0]}
                  className="recharts-bar-rectangle"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function getStatusCodeColor(statusCode: string): string {
  const code = Number.parseInt(statusCode);
  if (code < 300) return "#22c55e"; // green-500
  if (code < 400) return "#eab308"; // yellow-500
  if (code < 500) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}
