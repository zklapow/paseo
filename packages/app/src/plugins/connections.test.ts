import { describe, expect, it } from "vitest";
import type { PluginDirectConnectionInput } from "@getpaseo/plugin/client";
import { defaultHostAppearance } from "@/hosts/appearance";
import type { HostMutations } from "@/runtime/host-runtime";
import { createPluginConnections } from "./connections";

describe("plugin connections", () => {
  it("passes connection settings to authenticated registration and returns only host identity", async () => {
    const calls: PluginDirectConnectionInput[] = [];
    const mutations: Pick<HostMutations, "probeAndUpsertDirectConnection"> = {
      async probeAndUpsertDirectConnection(input) {
        calls.push(input);
        return {
          serverId: "daemon-1",
          hostname: "server.example",
          profile: {
            serverId: "daemon-1",
            label: "Remote workspace",
            appearance: defaultHostAppearance(),
            lifecycle: {},
            connections: [{ id: "direct", type: "directTcp", ...input }],
            preferredConnectionId: "direct",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          },
        };
      },
    };
    const input = {
      endpoint: "server.example:6767",
      useTls: true,
      password: "secret",
      label: "Remote workspace",
    };
    const host = await createPluginConnections(mutations).addDirect(input);
    expect(calls).toEqual([input]);
    expect(host).toEqual({ serverId: "daemon-1", label: "Remote workspace" });
  });

  it("does not leak credentials from a failed probe", async () => {
    const connections = createPluginConnections({
      async probeAndUpsertDirectConnection() {
        throw new Error("tcp://host:6767?password=secret");
      },
    });
    await expect(
      connections.addDirect({ endpoint: "host:6767", password: "secret" }),
    ).rejects.toThrow("Could not add connection. Check the address, password, and network access.");
  });
});
