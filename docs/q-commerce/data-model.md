# Q Commerce Operational Data Model

The command center should use a durable database such as Supabase/Postgres for operational state. These entities are designed around auditability and multi-brand expansion.

## `brands`

`id`, `name`, `platform`, `gm_agent_id`, `active`, `created_at`, `updated_at`.

Initial brands are `asset-ave` and `dream-blvd`.

## `agents`

`id`, `display_name`, `role`, `department`, `manager_agent_id`, `brand_scope`, `status`, `current_task_id`, `last_heartbeat_at`, `created_at`, `updated_at`.

## `agent_capabilities`

`agent_id`, `capability`, `enabled`, `policy_metadata`.

## `tasks`

`task_id`, `correlation_id`, `brand_id`, `assigned_agent_id`, `status`, `objective`, `input_summary`, `output_summary`, `current_blocker`, `next_action`, `updated_at`.

## `task_artifacts`

`task_id`, `artifact_type`, `location`, `description`, `created_at`.

## `task_model_runs`

`task_id`, `provider`, `model`, `started_at`, `finished_at`, `outcome`, `token_usage`, `estimated_cost`.

This table makes model switching observable without making any one model authoritative for task state.

## `events`

`id`, `occurred_at`, `brand_id`, `agent_id`, `agent_role`, `task_id`, `event_type`, `severity`, `summary`, `payload_json`, `requires_approval`, `approval_id`, `correlation_id`.

Index by `occurred_at`, `brand_id`, `event_type`, `correlation_id`, and `approval_id`.

## `approvals`

`id`, `created_at`, `decided_at`, `brand_id`, `requesting_agent_id`, `action_class`, `summary`, `expected_upside`, `downside_risk`, `estimated_cost`, `rollback`, `idempotency_key`, `status`, `decision_note`.

## `metrics`

`id`, `brand_id`, `metric_name`, `metric_value`, `captured_at`, `source`, `confidence`.

Use explicit confidence/source fields for attributed or inferred metrics.

## `campaigns`

`id`, `brand_id`, `name`, `channel`, `status`, `budget`, `approval_id`, `starts_at`, `ends_at`, `metadata_json`.

## `products`

`brand_id`, `external_product_id`, `sku`, `title`, `price`, `cost`, `active`, `updated_at`.

## `inventory_snapshots`

`brand_id`, `external_product_id`, `sku`, `quantity_available`, `captured_at`, `source`.

## `customer_escalations`

`id`, `brand_id`, `external_customer_id`, `external_order_id`, `severity`, `sentiment`, `summary`, `assigned_agent_id`, `status`, `created_at`, `resolved_at`.

Do not store unnecessary customer message bodies or sensitive payment data in the control-plane database.

## `integrations`

`id`, `brand_id`, `type`, `display_name`, `read_enabled`, `write_enabled`, `required`, `health_status`, `last_checked_at`.

Credentials are secret references, not columns containing plaintext secrets.

## `kill_switches`

`id`, `scope_kind`, `scope_id`, `enabled`, `reason`, `changed_by`, `changed_at`.

A system-level enabled switch disables all external writes. More specific switches block the matching brand, integration, campaign, or worker scope.

## Suggested RLS Boundary

The owner role can read the whole command center and decide approvals. Service roles receive only the database/table operations their workflow requires. Store connectors should not receive broad access to agent memory or unrelated brands.
