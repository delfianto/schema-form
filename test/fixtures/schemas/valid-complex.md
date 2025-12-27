# Valid Complex Schema

```yaml
fields:
  - name: task_name
    type: TEXT
    label: Task Name
    required: true
    placeholder: Enter task name...
    description: The name of the task
  - name: priority
    type: SELECT
    label: Priority
    options:
      - Low
      - Medium
      - High
    default: Medium
  - name: due_date
    type: DATE
    label: Due Date
  - name: is_active
    type: TOGGLE
    label: Active
    default: true
```
