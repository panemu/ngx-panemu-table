---
keyword: ErrorHandlingPage
---

Error handling is handled in `PanemuTableService.handleError`. You can create a custom [TableService](getting-started/configuration) and override the handler globally. But it can also be specified locally in per-component basis.

In below example, user can switch between global and local error handler.

{{ NgDocActions.demo("ErrorHandlingSample") }}
