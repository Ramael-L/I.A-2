<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application conventions
- Keep the prototype's native hash anchors and CSS :target/:checked DOM relationships in the index route; this preserves navigation and filters without replacing the supplied experience.
- Keep deterministic simulated replies in a browser-safe pure module with business-rule tests; no model, persistence or Moodle integration is implied by the prototype.
- Use the Button riwi/native variants for imported controls so the authoritative global design system retains their styling.
- Keep fault/edge-case detection and recovery replies in a pure module next to the board replies, with tests; the index route only routes detected faults to the dedicated #fallo state so the five original states stay untouched.
- Route every chat message (main composer and Nuevo chat) through src/lib/aiService.ts, which sanitizes with protegerDatos and checks requiereHumano before any reply; the UI never calls board/fault reply functions directly, so a real model can replace the local engine at the marked TODO.
- Keep responsible-AI rules (privacy masking, human escalation, bias explanation, transparency footer) in the pure src/lib/guardrails.ts module with tests; components only render its output.
- Use a single 260px left sidebar (no server rail); the board column collapses on desktop via the #collapse-board checkbox and stays a drawer below 1024px.

