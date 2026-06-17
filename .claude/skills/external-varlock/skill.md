---
name: external-varlock
description: Wrapper invoking Varlock before handling FRILO secrets, API keys, credentials, or sensitive configuration.
allowed-tools: Read
---

# External Skill: Varlock

## Source

Installed via: personal `~/.claude/skills/varlock`
Commands: invoke Varlock skill or its environment-specific workflow before secret handling.

## When to Invoke

Use before reading, editing, logging, documenting, or discussing `.env`, payment keys, webhook secrets, DB passwords, app keys, tokens, or credentials.

## How to Invoke

Load Varlock guidance and avoid exposing raw secret values in terminal output, logs, patches, or summaries.

## Expected Output

Secret-safe handling plan or confirmation that no sensitive values were exposed.

## Integration Points

Used in workflows: `auth-security-change`, `release-readiness`.
Replaces or extends internal skill: extends `security-change`.
