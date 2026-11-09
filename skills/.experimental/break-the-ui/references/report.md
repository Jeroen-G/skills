# Report template

Save as `break-the-ui-report-<date>.md` in the working directory.

```markdown
# Break the UI: <target>

Seed: <seed> · Attacks: <categories> · Surface: <screens/flows>
Grid: <N> rows · Breaks: <B> · Held: <H> · n/a: <X>

## Breaks

### [<severity>] <one-line title>
- **Attack**: <category / specific attack>
- **Where**: <screen> → <element>
- **Steps**: 1. … 2. … 3. …
- **Expected**: …
- **Actual**: …
- **Oracle**: <which oracle failed>
- **Evidence**: <screenshot path>, <log excerpt>
- **Suspected cause**: <optional, only if visible from logs or code>

## Held
<grid rows that survived, grouped by attack category>

## n/a
<rows skipped, each with a reason>
```

Severity:
- **critical**: crash, data loss, duplicate charge/record, security-relevant injection.
- **high**: flow blocked, lost state, silent failure on a main action.
- **medium**: layout or validation break with a workaround.
- **low**: cosmetic or minor a11y issue.
