import type { PluginConnections } from "@getpaseo/plugin/client";
import type { HostMutations } from "@/runtime/host-runtime";

export function createPluginConnections(
  mutations: Pick<HostMutations, "probeAndUpsertDirectConnection">,
): PluginConnections {
  return {
    async addDirect({ endpoint, useTls, password, label }) {
      try {
        const result = await mutations.probeAndUpsertDirectConnection({
          endpoint,
          useTls,
          password,
          label,
        });
        // Never return the credential-bearing host profile to plugin consumers.
        return { serverId: result.serverId, label: result.profile.label };
      } catch {
        // Transport errors can include a credential-bearing URI.
        throw new Error(
          "Could not add connection. Check the address, password, and network access.",
        );
      }
    },
  };
}
