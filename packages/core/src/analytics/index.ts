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

    return response.json();
  }

  export async function getAll(auth: Auth, dataset: string) {
    const response = await query(auth, `SELECT * FROM ${dataset}`);

    return (response as { data: Record<string, unknown>[] }).data;
  }
}
