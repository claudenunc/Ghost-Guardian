# Ghost Guardian — System Architecture (Pass 8: Production Activation)

## Overview

Ghost Guardian is built on a clean separation between the **Domain/Service Layer**, **Data Repositories**, **Authentication**, **Platform Adapters**, and **Hybrid Guardian Intelligence Pipeline**.

```
                           Ghost Guardian Client (React 19)
                                          │
                                 Application Runtime
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
                Demo Mode                                Production Mode
            (Browser Fixture)                          (REST / HTTP Server)
                    │                                           │
                    │                               ┌───────────┴───────────┐
                    │                               │                       │
                    │                          Node Backend            Database Engine
                    │                       (server/api/router)      (data/ghost_guardian.json)
                    │                               │
                    │                   ┌───────────┼───────────┐
                    │                   │           │           │
                    │              YouTube API     LLM      Encryption
                    │             (OAuth 2.0)   (Gemini)    (AES-256-GCM)
                    │                   │           │           │
                    └───────────────────┼───────────┴───────────┘
                                        │
                           Guardian Domain Engine
                                        │
                ┌───────────────────────┴───────────────────────┐
                │                                               │
      Deterministic Safety                               Voice Profiler
   - Threats / Self-Harm                            - Tone & Style Parameters
   - Creator Topic Boundaries                       - Signature Vocabulary
   - Keyword Phrase Shields                         - Approved Knowledge Base
   - Policy Matrix & Silence Rules
```

---

## Hybrid Intelligence Pipeline

Ghost Guardian implements a strict **Hybrid Intelligence Architecture** where deterministic creator authority governs non-deterministic LLM generation:

```
[ INCOMING COMMENT ]
       │
       ▼
1. Deterministic Safety & Policy Pre-Check
   - Threats / Doxxing -> Quarantined in Shield Vault & Escalated (Precedence Level 1)
   - Personal Distress -> Isolated as Human Moment for Creator Attention (Precedence Level 1)
   - Topic Boundaries -> Intercepted for Creator Review (Precedence Level 2)
   - Keyword Shields -> Configured Protective Action (Precedence Level 3)
       │
       ├─► (If Safety / Policy violation): STOP. Enforce human review or shield.
       │
       ▼ (If permitted for drafting)
2. LLM Semantic Understanding & Voice Alignment
   - Analyzes intent, context, and sentiment
   - Generates draft matching creator's warmth, directness, formality, and humor
   - Grounds answers in approved creator transcripts and FAQs
       │
       ▼
3. Deterministic Post-Generation Validation
   - Verifies draft violates no keyword shields or creator topic boundaries
   - Fails closed if boundary violation or prohibited claim is detected
       │
       ▼
4. Creator Review / Authorized Automation
   - Creator reviews, edits, or approves in ResponseEditor
   - Human Moments and Critical Threats NEVER auto-publish
       │
       ▼
5. Fail-Closed Platform Publishing
   - Validates active OAuth token and platform permissions
   - Posts reply to YouTube Data API v3
   - Creates immutable activity event and audit log
```

---

## Security & Privacy Discipline

1. **Zero Client-Side Credentials**: OAuth access tokens, refresh tokens, client secrets, and API keys are stored exclusively on the server and encrypted at rest using AES-256-GCM.
2. **Deterministic Precedence**: VIP status can never bypass physical safety policies or crisis protocols.
3. **Fail-Closed Publishing**: If token validity, authorization scope, or policy checks fail, publication is strictly aborted.
4. **Data Portability**: Full workspace JSON exports strip all transient session states and verify that zero secrets or tokens are exported.
