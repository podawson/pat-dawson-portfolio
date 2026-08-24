# Release Intelligence

> Editable copy snapshot for the dedicated project page. Send edits back to sync them with `app/data.ts`.

## Page label

Tricky · 2026

## Question

How do you turn one release into five honest documents without rewriting it five times?

## Headline

Deterministic classification replaced a black-box LLM step, cutting the unexplainable custom bucket from 40–60% to under 5%.

## Summary

The model handles voice and format only. Python owns classification and grouping, verbatim narrative seeds constrain generation, and a proportional review gate routes the PM to the 2–3 items that matter.

## Role

AI systems designer · pipeline architect

## Outcome

Five consistent outputs per cycle, a deterministic audit trail, and a workflow handed off for non-engineering ownership.

## Categories

- Systems
- Experience

## Operating story

One release cycle required the same Linear tickets to be rewritten for five audiences: customer release notes, internal changelog, sales brief, support FAQ, and Slack. A first all-LLM approach failed in the useful way—tickets classified differently across runs, 40–60% fell into an unexplainable custom bucket, and nobody could see why. The fix was architectural, not another prompt. Classification and grouping moved into deterministic Python; the model became responsible only for voice and format. Six stages and a sixteen-field schema feed five audience-specific prompt contracts. Verbatim narrative seeds prevent unsupported feature claims. Three validation passes each target a failure the model had actually made. Across 12+ batches and 100+ tickets, the custom bucket fell below 5% and PM work dropped from 3–5 hours to 20–40 minutes. A review gate concentrates attention on the 2–3 high-risk items instead of pretending the system no longer needs an owner.

## Where authorship stays human

The pipeline classifies and drafts inside explicit bounds; a PM reviews the high-risk items and remains the publisher of record.

## By the numbers

- 40–60% → <5% custom bucket
- 3–5 hr → 20–40 min per cycle
- 12+ batches / 100+ tickets

## Artifacts that carry the case

- Pencil architecture → functional system
- Six-stage pipeline diagram
- Batch-by-batch error table

## Details

### 01 · Move facts out of the model

Deterministic Python owns classification and grouping, so identical tickets produce identical, auditable results.

### 02 · Constrain generation

Each audience has its own contract, but every claim must originate in a verbatim narrative seed from the source ticket.

### 03 · Review proportionally

Validation routes PM attention to 2–3 high-risk items instead of demanding blanket review or pretending review is unnecessary.
