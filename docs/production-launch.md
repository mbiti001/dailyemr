# Daily EMR Production Rollout Blueprint

_Last updated: October 19, 2025_

## 1. Target architecture (AWS reference stack)

```
Users → CloudFront CDN → Application Load Balancer → ECS Fargate (Next.js container)
                                   ↓
                         AWS RDS PostgreSQL (Multi-AZ)
                                   ↓
                        AWS ElastiCache Redis (Session cache)
                                   ↓
                        Amazon S3 (assets, exports)
                                   ↓
                        Amazon SES / SNS (notifications)

CI/CD (GitHub Actions) → ECR (container registry) → Terraform Cloud / Atlantis for IaC apply
```

- **Region**: `af-south-1` (Cape Town) or `eu-west-1` (Ireland) depending on latency/legal preferences. Kenya Data Protection Act permits storage abroad with safeguards; confirm contractual requirements.
- **Networking**: VPC with public subnets (ALB) and private subnets (ECS tasks, RDS, Redis). Security groups enforce least privilege; AWS WAF shields ALB.

## 2. Environment strategy

| Environment | Purpose | Branch | Deployment cadence | Notes |
| --- | --- | --- | --- | --- |
| **Development** | Team feature work | feature branches | On demand via Vercel preview or ECS staging | Short-lived, seeded DB snapshots. |
| **Staging** | Pre-production verification | `main` | Continuous after CI green | Mirrors production infra; synthetic + beta facility traffic. |
| **Production** | Live facilities | `production` (protected) | Manual promotion or release train | Feature flags control gradual rollouts. |

## 3. Secrets & configuration

- Managed in AWS Secrets Manager or HashiCorp Vault.
- `.env.production` values injected at build/deploy time.
- Key secrets: `DATABASE_URL`, `SESSION_PASSWORD`, `SHA_API_KEY`, `MFL_API_KEY`, `DHIS2_TOKEN`, third-party keys (telehealth, payments, LaunchDarkly, Auth0).
- Use SOPS + age for Git-based secret management if Terraform Cloud is not used.

## 4. Data & compliance guardrails

- **Backups**: RDS automated backups (7-day retention minimum), nightly logical dump to S3 (gzip + AES256), cross-region replication to `eu-west-1`.
- **Disaster recovery**: Warm standby (pilot light) in secondary region; failover runbooks tested quarterly.
- **Audit**: CloudTrail organization trails, CloudWatch log retention 400 days, route Prisma audit events to Kinesis Firehose → S3 + OpenSearch.
- **Access control**: SSO via AWS IAM Identity Center (integrated with corporate IdP). Principle of least privilege enforced through IAM roles.

## 5. Monitoring & SLOs

- **SLO targets**:
  - Availability: 99.9% monthly for clinician-facing services.
  - P95 API latency: ≤ 600ms.
  - P95 page load (LCP): ≤ 2.5s on 4G.
  - Error budget policy: 28 min downtime/month before release freeze.
- **Observability**:
  - OpenTelemetry SDK in app → AWS Distro for OTEL → Grafana Tempo (traces), Loki (logs), Prometheus (metrics).
  - PagerDuty escalation for high-severity alerts (per runbook).

## 6. Release governance

1. Merge to `main` → CI (lint/typecheck/test) → staging deploy (auto).
2. End-to-end smoke suite executes against staging (Cypress/Playwright).
3. Feature flag toggles validated; LaunchDarkly change requests signed off by product + clinical lead.
4. Promote Git tag to `production` branch → GitHub Action builds immutable image, runs database migrations, deploys to ECS with canary (10% traffic for 30 mins) before full cutover.
5. Post-deploy verification checklist logged in incident management tool.

## 7. Incident response

- On-call rotation with 30-minute response SLA.
- Runbooks for: app outage, database failover, high error rate, queue backlog, claims API outage, telehealth provider degradation.
- Blameless postmortems within 48 hours; actions tracked in Jira.

## 8. Launch readiness checklist

- [ ] Production AWS account provisioned with guardrails (Control Tower / Landing Zone).
- [ ] Terraform state backend secured (Terraform Cloud or S3 + DynamoDB lock).
- [ ] Networking design implemented (VPC, subnets, NAT, route tables).
- [ ] RDS Postgres cluster created (instance class `db.m6g.large`, Multi-AZ, encryption at rest).
- [ ] Redis replication group (ElastiCache) created for session/queue support.
- [ ] ECS cluster + Fargate service defined (min 2 tasks, target tracking scaling on CPU 60%).
- [ ] Container image pipeline (ECR repo, image scanning) operational.
- [ ] Secrets Manager entries populated and CI wired to retrieve at deploy time.
- [ ] Observability stack deployed and dashboards configured.
- [ ] DR failover rehearsal completed and documented.
- [ ] Security review passed (penetration test, threat model updates).
- [ ] Clinical change advisory board sign-off.

---

This blueprint pairs with the modernization roadmap to guide the production rollout. Use it as the north star for the infrastructure team while product and clinical squads finalize workflow readiness.
