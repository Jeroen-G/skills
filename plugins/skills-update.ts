/**
 * OpenCode V2 plugin: keep installed agent skills up to date.
 *
 * Copy this file to ~/.config/opencode/plugins/skills-update.ts (global) or to
 * .opencode/plugins/skills-update.ts in a single project, then restart OpenCode:
 *
 *   opencode service restart
 *
 * OpenCode discovers it automatically; no config change is required.
 *
 * On load, and on each new session, it runs `npx -y skills update -g -y` at most
 * once a day, then reloads OpenCode's skill registry so updated skills are picked
 * up without a restart.
 */
import { Plugin } from "@opencode/plugin"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const DAY_MS = 24 * 60 * 60 * 1000

export default Plugin.define({
  id: "skills-update",
  setup(ctx) {
    let running = false

    const update = async () => {
      if (running) return

      const last = await ctx.storage.get("lastUpdate")
      if (typeof last === "number" && Date.now() - last < DAY_MS) return

      running = true
      try {
        await execFileAsync("npx", ["-y", "skills", "update", "-g", "-y"], {
          timeout: 120_000,
        })
        await ctx.storage.set("lastUpdate", Date.now())
        await ctx.skill.reload()
        console.error("[skills-update] skills refreshed")
      } catch (err) {
        console.error("[skills-update] update failed:", err)
      } finally {
        running = false
      }
    }

    // Once when the plugin loads...
    void update()

    // ...and on every new session.
    const controller = new AbortController()
    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
          if (event.type === "session.created") void update()
        }
      } catch (err) {
        if (!controller.signal.aborted) console.error("[skills-update] event stream ended:", err)
      }
    })()

    return () => controller.abort()
  },
})
