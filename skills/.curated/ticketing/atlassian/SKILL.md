---
name: atlassian
description: >
  Use atlassian-cli to look up or search Jira issues and Confluence pages.
---

# Atlassian

## Steps

1. Resolve the target: use an issue key, project key, space key, or page ID when provided. For a page title, search first. If several results could match, ask the user to choose.
2. Take a **one-shot** line below if one fits. Only when none fits, read the CLI's help for that subcommand (`atlassian-cli jira issue --help`, `atlassian-cli confluence --help`) — syntax comes from there, never from memory.
3. **Fetch once.** Write the result to a temp file with only the fields you need, aggregate it there (`jq`), and print the aggregates — the raw payload is rarely what the answer needs.
4. If authentication fails, report the blocker and stop.
5. Report only fields returned by the CLI; don't infer missing details. If there are no results, say so.

## One-shot

Examples use placeholder keys, fields, and page ids — substitute values for your own instance.

```bash
# one ticket, curated view (description, status, links)
atlassian-cli jira issue get PROJ-123
# one ticket, exact fields
atlassian-cli jira issue get PROJ-123 --fields 'summary,status,fixVersions' --format csv
# every ticket matching a query
atlassian-cli jira issue search --jql 'project = PROJ AND status = "New"' --fields 'key,summary,fixVersions' --limit 0 --format csv
# find pages, then read one
atlassian-cli confluence search text 'release notes' --limit 20 --format csv
atlassian-cli confluence page get 123456789 --body-only
```

## Reference

- `jira issue search` is the entry point for every read — there is no `issue list`; express "list" as JQL.
- `--jql '<JQL>'` goes in a flag, never as a positional argument. `--limit 0` returns every match.
- `--fields` takes field ids. Field ids are specific to each Jira instance, so a display name may be rejected as ambiguous and the id an error suggests may not apply to every project on that instance. Confirm the id for the fields you need (for example Story Points or Flagged) against your instance before relying on it.
- `--format csv` for tabular reads, `json` when `jq` processes it, `quiet` for a bare key list. Count with `--fields key --limit 0`.
- `--envelope` is advertised globally but ignored by `jira issue search` — it returns a bare array.
- Confluence also has `confluence search cql|in-space`, and `confluence page list <space>`.
