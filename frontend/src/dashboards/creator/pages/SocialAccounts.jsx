import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/v1/social-accounts";

export default function SocialAccounts() {
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token =localStorage.getItem("token") || localStorage.getItem("orbit-token");
      console.log("Token:", token);
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/social-accounts/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch social accounts.");
      }

      const data = await response.json();

      console.log("Social accounts:", data);

      setConnectedPlatforms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setConnectedPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  const availableAccounts = [
    {
     name: "Facebook",
     url: `${API_URL}/facebook/connect`,
    },
    {
      name: "Instagram",
      url: `${API_URL}/instagram/connect`,
    },
    {
      name: "LinkedIn",
      url: `${API_URL}/linkedin/connect`,
    },
    {
      name: "X (Twitter)",
      url: `${API_URL}/twitter/connect`,
    },
    {
      name: "YouTube",
      url: `${API_URL}/youtube/connect`,
    },
    {
      name: "Pinterest",
      url: "#",
    },
  ];

  const connectAccount = (url) => {
    if (url !== "#") {
      window.location.href = url;
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="mb-6 text-3xl font-bold">
        Social Accounts
      </h1>

      <h2 className="mb-4 text-xl font-semibold">
        Connected Platforms
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {connectedPlatforms.length === 0 ? (
            <p className="text-gray-400">
              No connected accounts found.
            </p>
          ) : (
            connectedPlatforms.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-2xl border border-gray-700 p-5"
              >
                <div>
                  <h3 className="text-lg font-semibold capitalize">
                    {account.platform}
                  </h3>

                  <p className="text-sm text-gray-400">
                    @{account.username || "Unknown"}
                  </p>

                  <p className="text-sm text-gray-400">
                    Followers: {account.followers_count || 0}
                  </p>

                  <p className="text-sm text-green-400">
                    Status: {account.status}
                  </p>

                  <p className="text-xs text-gray-500">
                    Health: {account.health}
                  </p>

                  <p className="text-xs text-gray-500">
                    Last sync:{" "}
                    {account.last_sync
                      ? new Date(account.last_sync).toLocaleString()
                      : "Never"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="rounded-lg border border-gray-600 px-4 py-2">
                    Details
                  </button>

                  <button className="rounded-lg bg-red-500 px-4 py-2">
                    Disconnect
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <h2 className="mb-4 mt-10 text-xl font-semibold">
        Available Platforms
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {availableAccounts.map((account) => (
          <div
            key={account.name}
            className="rounded-2xl border border-gray-700 p-6"
          >
            <h3 className="mb-2 text-lg font-semibold">
              {account.name}
            </h3>

            <p className="mb-4 text-sm text-gray-400">
              Not connected
            </p>

            <button
              onClick={() => connectAccount(account.url)}
              className="rounded-lg bg-blue-500 px-4 py-2"
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}