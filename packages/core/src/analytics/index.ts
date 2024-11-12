const ANALYTICS_ENGINE_DATASET = "workerspy_requests";

export namespace Analytics {
  export interface Auth {
    accountId: string;
    token: string;
  }

  export async function query(auth: Auth, query: string) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/analytics_engine/sql`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: query,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to query Analytics Engine: ${await response.text()}`,
      );
    }

    return response.json();
  }

  export async function getAll(auth: Auth, dataset: string) {
    const response = await query(auth, `SELECT * FROM ${dataset}`);

    return (response as { data: Record<string, unknown>[] }).data;
  }

  export interface TimeSeriesOptions {
    /** Interval in minutes. Defaults to 10 */
    intervalMinutes?: number;
    /** Number of days to look back. Defaults to 14 */
    lookbackDays?: number;
  }

  export interface TimeSeriesDataPoint {
    timestamp: string;
    avgDuration: number;
    count: number;
  }

  export async function getProxyDurationTimeSeries(
    auth: Auth,
    proxyId: string,
    options: TimeSeriesOptions = {},
  ): Promise<TimeSeriesDataPoint[]> {
    const intervalMinutes = options.intervalMinutes ?? 10;
    const lookbackDays = options.lookbackDays ?? 14;

    // Note: We use _sample_interval to account for sampling
    // We use toStartOfInterval to bucket the timestamps into intervals
    const sql = `
      SELECT
        toStartOfInterval(timestamp, INTERVAL '${intervalMinutes}' MINUTE) as timestamp,
        SUM(_sample_interval * double1) / SUM(_sample_interval) as avgDuration,
        SUM(_sample_interval) as count
      FROM ${ANALYTICS_ENGINE_DATASET}
      WHERE 
        timestamp > NOW() - INTERVAL '${lookbackDays}' DAY
        AND index1 = '${proxyId}'
      GROUP BY timestamp
      ORDER BY timestamp ASC
      FORMAT JSON
    `;

    const response = await query(auth, sql);

    // The response will be in the format: { meta: [], data: [], rows: number }
    return (response as { data: TimeSeriesDataPoint[] }).data.map((point) => ({
      ...point,
      // Round numbers to 2 decimal places for cleaner display
      avgDuration: Math.round(point.avgDuration * 100) / 100,
      count: Math.round(point.count),
    }));
  }

  export interface StatusCodeDataPoint {
    timestamp: string;
    statusCode: string;
    count: number;
  }

  export async function getProxyStatusCodeTimeSeries(
    auth: Auth,
    proxyId: string,
    options: TimeSeriesOptions = {},
  ): Promise<StatusCodeDataPoint[]> {
    const intervalMinutes = options.intervalMinutes ?? 10;
    const lookbackDays = options.lookbackDays ?? 14;

    const sql = `
      SELECT
        toStartOfInterval(timestamp, INTERVAL '${intervalMinutes}' MINUTE) as timestamp,
        blob2 as statusCode,
        SUM(_sample_interval) as count
      FROM ${ANALYTICS_ENGINE_DATASET}
      WHERE 
        timestamp > NOW() - INTERVAL '${lookbackDays}' DAY
        AND index1 = '${proxyId}'
      GROUP BY timestamp, blob2
      ORDER BY timestamp ASC, count DESC
      FORMAT JSON
    `;

    const response = await query(auth, sql);

    return (response as { data: StatusCodeDataPoint[] }).data.map((point) => ({
      ...point,
      count: Math.round(point.count),
    }));
  }
}
