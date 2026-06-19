# Database patches

Prose uses Hibernate's `spring.jpa.hibernate.ddl-auto=update`, which generates
schema from JPA entities at startup. A few cases that auto-DDL does not handle
required manual patches. Apply them in numeric order against an existing
database that hits the corresponding issue. They are idempotent.

| # | File | When to apply |
|---|---|---|
| 001 | `001_millieu_evaluation_id_sequence.sql` | If inserting a `millieu_evaluation` row fails with a NOT NULL violation on `millieu_evaluation_id`. Creates the missing sequence and wires it as the column default. |
| 002 | `002_notification_discriminator.sql` | If you see `Unrecognized discriminator value: etudiant_cv` at runtime. Removes obsolete rows from an earlier discriminator scheme. |
| 003 | `003_notification_stage_id_unique_drop.sql` | If updating an entente notification fails on a unique constraint over `notification.stage_id`. Drops the constraint so multiple notifications per stage are allowed. |

Apply against a running database with:

```bash
psql "$PROSE_DB_URL" -f db/patches/001_millieu_evaluation_id_sequence.sql
```

A future cleanup would move all schema management to Flyway or Liquibase and
fold these patches into versioned migrations.
