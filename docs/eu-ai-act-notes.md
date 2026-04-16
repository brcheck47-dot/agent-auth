# EU AI Act – Relevant Articles for Agent Auth

## Article 12 (Record-keeping)
- High-risk AI systems must log events for at least 6 months
- Logs must be tamper-proof and accessible to national authorities

## Article 50 (Transparency for AI-generated content)
- AI-generated text, image, audio, video must be labeled as such
- Labels must be machine-readable and detectable
- Deadline: August 2, 2026

## Article 52 (Obligations for providers)
- Providers must implement technical solutions to ensure compliance
- This includes identity, logging, and kill switch capabilities

---

## Code of Practice v1 - Implementation Checklist

### Phase 1: Machine-Readable Labeling (Week 4)
- [ ] Add X-AI-Generated: true header to all agent responses
- [ ] Add X-AI-Agent-ID header with agent's SPIFFE ID
- [ ] Add X-Compliance: EU-AI-Act-Article-50 header

### Phase 2: Metadata Embedding (Week 4)
- [ ] Embed JSON metadata block in response body (for API responses)
- [ ] Provide JavaScript widget for UI-based disclosure

### Phase 3: Deployer Guidance (Week 6)
- [ ] Dashboard shows compliance status (green/yellow/red)
- [ ] One-click compliance report generation (PDF)

### Phase 4: Record-Keeping (Week 3)
- [ ] Log retention policy set to 6 months minimum
- [ ] Input/Output hashing implemented (SHA-256)
- [ ] Tamper-proof audit trail (append-only, signed logs)

### Phase 5: Watermarking Preparation (Post-Launch)
- [ ] Placeholder in compliance_tags for future watermarking standards
- [ ] Monitor EU AI Office updates for final Code of Practice (June 2026)
