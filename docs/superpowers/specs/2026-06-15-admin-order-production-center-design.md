# FRILO Admin Order Production Center Design

## Goal

Turn the admin order detail page into a practical production cockpit for delivering FRILO websites within the promised 48-hour window.

FRILO is not only selling templates. It sells a guided outcome: a client chooses a model, pays, gives useful information, and receives a professional site without managing an agency project. The admin interface must therefore help the FRILO team know what to do next, what is missing, who owns the work, and whether the order is ready to be delivered.

## Scope

This V1 improves the existing admin order detail page at `/admin/orders/{order}`. It does not create a separate production board yet.

The order status workflow remains unchanged:

```text
pending -> processing -> completed
    |
    v
cancelled
```

`OrderService::updateStatus()` remains the only place where the main order status can change. The production center adds operational fields around the order; it does not replace the existing order workflow.

## Admin User Story

As a FRILO administrator, when I open a command, I need to immediately understand:

- what the client bought;
- what options changed the final price;
- whether the client sent enough content;
- who is responsible for the order internally;
- what production steps are already done;
- what must be checked before delivery;
- whether the client has been reminded;
- which site URL, domain, and hosting date were delivered.

## Information Architecture

The admin order detail page should be reorganized around operational work.

### 1. Operational Summary

Displayed near the top of the page.

It shows:

- order number;
- current status;
- selected template;
- final price;
- selected paid options;
- production owner;
- content completeness state;
- current SLA signal.

The completeness state is computed from required client material checks. It uses two simple labels:

- `Complet`;
- `A completer`.

The SLA signal should remain practical:

- `Dans les temps`;
- `Attention`;
- `En retard`.

No new complex SLA engine is required in this V1. The page can derive the signal from existing order timestamps and configured deadlines.

### 2. Client Material

This block answers: "Can production start cleanly?"

Track these checks:

- business/activity description received;
- logo received;
- photos or visual material received;
- texts received;
- contact details received;
- preferred colors received.

Each item is a boolean. The admin can update them independently. A short internal note field can explain what is missing.

### 3. Production Tracking

This block answers: "Where are we in the work?"

Track:

- production owner name;
- assigned at date/time;
- template adapted;
- client content integrated;
- preview prepared;
- preview sent at date/time;
- client feedback received;
- corrections completed.

This is an internal checklist. It does not change the public order status by itself.

### 4. Quality Before Delivery

This block answers: "Can we responsibly mark the site as delivered?"

Track:

- mobile responsive checked;
- contact form tested;
- important links checked;
- spelling reviewed;
- client business information verified;
- final preview validated.

When an admin tries to move the order to `completed`, the interface should warn if any quality item is missing. In V1, this is a strong warning rather than a hard block, so operations are not trapped during exceptional cases.

### 5. Delivered Site

This block answers: "What exactly did the client receive?"

Track:

- site URL;
- domain;
- hosting expiration date;
- SSL checked;
- contact form checked after publication;
- mobile checked after publication;
- final delivery note.

Some of these fields already exist or have been started locally. This V1 should consolidate them visually inside the production center.

### 6. Client Follow-up

This block answers: "Did we relaunch the client when something was missing?"

Track:

- last reminder date/time;
- reminder count;
- last reminder reason;
- internal follow-up note.

This V1 does not need to send WhatsApp or email automatically. The admin records the reminder after using the operational channel.

## Data Model

Add production-specific fields to the `orders` table for V1, because the data belongs to one order and does not yet require a full event system.

Recommended fields:

- `production_owner_name` nullable string;
- `production_assigned_at` nullable datetime;
- `material_activity_received` boolean default false;
- `material_logo_received` boolean default false;
- `material_photos_received` boolean default false;
- `material_texts_received` boolean default false;
- `material_contacts_received` boolean default false;
- `material_colors_received` boolean default false;
- `material_missing_note` nullable text;
- `production_template_adapted` boolean default false;
- `production_content_integrated` boolean default false;
- `production_preview_prepared` boolean default false;
- `production_preview_sent_at` nullable datetime;
- `production_feedback_received` boolean default false;
- `production_corrections_completed` boolean default false;
- `quality_mobile_checked` boolean default false;
- `quality_form_checked` boolean default false;
- `quality_links_checked` boolean default false;
- `quality_spelling_checked` boolean default false;
- `quality_business_info_checked` boolean default false;
- `quality_final_preview_validated` boolean default false;
- `delivery_ssl_checked` boolean default false;
- `delivery_form_checked` boolean default false;
- `delivery_mobile_checked` boolean default false;
- `delivery_note` nullable text;
- `last_client_reminder_at` nullable datetime;
- `client_reminder_count` unsigned integer default 0;
- `last_client_reminder_reason` nullable string;
- `internal_follow_up_note` nullable text.

The existing delivered-site fields remain part of the order:

- `site_url`;
- `domain`;
- `hosting_expires_at`.

## Backend Design

Follow the established Laravel flow:

```text
Controller -> FormRequest -> Policy -> Service -> Model
```

### Service

Create or extend an admin-facing service that updates production metadata without changing the order status. The service should expose focused methods:

- update assignment;
- update client material checks;
- update production checks;
- update quality checks;
- update delivered site information;
- record client reminder.

The status transition method remains `OrderService::updateStatus()`.

### Requests

Use dedicated FormRequests for each update surface, or one carefully scoped `UpdateOrderProductionRequest` if the UI posts all production fields at once.

The request must never accept:

- `user_id`;
- `price`;
- `status`;
- `template_id`.

### Authorization

Every admin update must authorize through the existing admin access rules. If an `OrderPolicy` admin method exists, reuse it. Otherwise add an explicit production update policy method.

### Audit

Every sensitive production mutation should create an audit event:

- assignment updated;
- client material updated;
- production checklist updated;
- quality checklist updated;
- delivery information updated;
- client reminder recorded.

## Frontend/Admin UI Design

This is Blade admin, not the public Next.js interface.

The page should feel like an operational file, not a marketing screen.

Recommended layout:

- top summary band with order status, completeness, owner, and SLA signal;
- two-column desktop layout;
- single-column mobile layout;
- compact cards or bordered sections;
- no nested cards;
- clear section headings;
- toggles or checkboxes for checklist items;
- save buttons close to the section they update;
- red only for risk, overdue, or primary action.

The page must keep existing order information visible:

- client;
- template;
- sector;
- price;
- selected options;
- payment state;
- instructions.

## Public/Client Impact

This V1 is primarily admin-side.

Client-facing changes should be limited to exposing delivered-site fields already intended for the client dashboard:

- site URL;
- domain;
- hosting expiration date.

Internal production checks must not be exposed to clients.

## Edge Cases

- Order has no selected paid options: show base price and a calm empty state.
- Order is `completed`: production fields remain visible; status remains terminal.
- Order is `cancelled`: production fields remain visible but status actions stay restricted.
- Admin tries to complete without quality checks: show warning with missing checks.
- Missing client materials: show `A completer` and the missing note.
- Reminder count starts at `0` and increments only when a reminder is explicitly recorded.

## Acceptance Criteria

- Admin order detail page displays an operational summary.
- Admin can assign a production owner and assignment date is stored.
- Admin can mark each client material item as received or missing.
- Completion state changes between `Complet` and `A completer`.
- Admin can update production checklist items.
- Admin can update quality checklist items.
- Admin sees a strong warning before completing an order with missing quality checks.
- Admin can record delivered site URL, domain, hosting expiration, and delivery checks.
- Admin can record a client reminder reason and the reminder count increases.
- Main status transitions still go through `OrderService::updateStatus()`.
- Existing client, catalogue, payment, and order-option behavior remains unchanged.
- Backend QA passes.
- Admin flow is verified in the integrated browser on local Docker.

## Out Of Scope For This V1

- A separate production board.
- Automatic WhatsApp sending.
- Full internal staff user management.
- Hard SLA incident workflow.
- Public exposure of internal production checklist.
- Replacing the existing order status model.

## Future Iterations

After this V1 is stable, FRILO can add:

- global production board filtered by owner and SLA;
- internal staff roles beyond `super_admin`;
- automated reminder templates;
- SLA incident records;
- weekly operations metrics;
- renewal pipeline for annual hosting.
