import { describe, expect, it, vi } from "vitest";
import { createPluginConnections } from "./connections";

describe("plugin connections", () => {
  it("uses authenticated host registration and returns only public host identity", async () => {
    const probe = vi.fn().mockResolvedValue({
      serverId: "daemon-1",
      profile: { label: "Workspace", connections: [{ password: "secret" }] },
    });
    const input = {
      endpoint: "workspace.example:6767",
      useTls: true,
      password: "secret",
      label: "Workspace",
    };
    const result = await createPluginConnections({
      probeAndUpsertDirectConnection: probe,
    }).addDirect(input);
    expect(probe).toHaveBeenCalledWith(input);
    expect(result).toEqual({ serverId: "daemon-1", label: "Workspace" });
  });

  it("does not leak credentials from a failed probe", async () => {
    const probe = vi.fn().mockRejectedValue(new Error("tcp://host:6767?password=secret"));
    await expect(
      createPluginConnections({ probeAndUpsertDirectConnection: probe }).addDirect({
        endpoint: "host:6767",
        password: "secret",
      }),
    ).rejects.toThrow("Could not add connection. Check the address, password, and network access.");
  });
});
