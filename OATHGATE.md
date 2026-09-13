# Oathgate connection integration

This branch starts at Paseo v0.8.0 and exposes optional
`PluginSurfaceProps.connections.addDirect({ endpoint, useTls, password, label })`.
It returns `{ serverId, label }` after authenticating and saving the host through
Paseo's existing connection registry. Repeated adds match daemon identity.
Failures return a credential-safe message. No provider or backend connection
lifecycle API is added.

The Oathgate plugin feature-detects this API. Its Add connection button fetches
credentials through `og paseo`, then saves the host without showing the password.
Stock clients retain the manual connection form. The UI uses the same native
button, busy state, and notification patterns as the existing plugin.

## Verification

```sh
npm ci
npm run build:app-deps
npm run typecheck --workspace=@getpaseo/app
npm run typecheck --workspace=@getpaseo/plugin
cd packages/app
npx vitest run --project unit src/plugins/connections.test.ts src/runtime/host-runtime.test.ts
EXPO_NO_TELEMETRY=1 PASEO_WEB_PLATFORM=electron npx expo export --platform web
```

On September 13, 2026, the two test files passed all 73 tests. Both typechecks
and the Electron renderer export passed. The renderer was tested inside a copy
of the official macOS 0.8.0 app, using its existing Electron/main-process/daemon
binaries, with a local development signature and an isolated client profile.
This was a renderer-only development build, not a newly notarized full release.

A live Oathgate workspace was added from the plugin, appeared Online in Hosts,
reconnected after a renderer reload, and remained a single host after a second
Add connection action. The test workspace used the deployed Paseo 0.7.2 daemon;
the client and local plugin host were 0.8.0.

For a full desktop package, the upstream `npm run build:desktop` workflow builds
the renderer, main process, and bundled daemon. Normal platform signing and
packaging requirements still apply. The fork does not change the upstream
update feed; installing an upstream app update removes the custom capability,
and the Oathgate plugin falls back to manual fields.
