# Gleanings

> Editable copy snapshot for the dedicated project page. Send edits back to sync them with `app/data.ts`.

## Page label

Tricky · 2025–26

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

## Operating story

Project risk rarely sits inside one document. It appears between a schedule and a drawing set, a budget and a field note, an RFI and the decision it is waiting on. Gleanings ingests those heterogeneous records together and surfaces the conflicts between them: scope drift, budget-to-actuals gaps, unresolved dependencies, and downstream cost that only becomes visible when several sources are read against one another. The ranking is the product. An unranked list of every discrepancy simply creates another coordination burden, so findings are ordered by anticipated cost and schedule impact and returned with their source trail intact. The system does not make the project decision. It routes scarce reviewer attention to the conflicts most likely to compound into change orders, preserving enough evidence for the accountable project manager to agree, reject, or investigate. The agent was handed off and put into use.

## Where authorship stays human

The agent ranks evidence-backed conflicts; the project manager remains responsible for interpreting context and authorizing action.

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
