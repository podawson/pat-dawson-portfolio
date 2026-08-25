# Gleanings

> Editable copy snapshot for the dedicated project page. Send edits back to sync them with `app/data.ts`.

## Page label

Tricky · 2026

## Question

Can an agent read a whole project’s paperwork and tell you what is about to become expensive?

## Headline

A reasoning agent reads schedules, drawings, budgets, and meeting notes together, then ranks conflicts by anticipated cost and schedule impact.

## Summary

The interface is built for triage rather than exhaustiveness: a project manager needs the three discrepancies worth acting on, with the evidence chain still attached.

## Role

Product design · reasoning architecture · build

## Outcome

A handed-off project-reasoning workflow that turns cross-document conflict into a prioritized, inspectable action list.

## Categories

- Systems
- Experience

## The triage model

### Find the three conflicts worth acting on.

Project risk appears between documents: a schedule and drawing set, a budget and field note, an RFI and the decision it awaits. Gleanings reads those records together, surfaces scope drift and unresolved dependencies, then ranks findings by anticipated cost and schedule impact. Every issue keeps its source trail attached. The system replaces an exhaustive discrepancy list with a short, evidence-backed queue a project manager can confirm, reject, or investigate.

## Who authorizes action

The agent ranks evidence-backed conflicts; the project manager interprets context and decides what happens next.

## By the numbers

- 4+ heterogeneous source classes
- Conflicts ranked by cost + schedule
- Human review before action

## Artifacts that carry the case

- File-ingestion and reconciliation map
- Ranked discrepancy interface
- Finding-to-source evidence trail

## Details

### 01 · Read across the project

Schedules, drawings, budgets, RFIs, and notes stay distinct while the system searches for consequential disagreement between them.

### 02 · Rank what compounds

Findings are ordered by anticipated cost and schedule impact rather than by detection order or document type.

### 03 · Keep the source attached

Every proposed issue points back to the evidence a project manager needs to confirm or dismiss it.
