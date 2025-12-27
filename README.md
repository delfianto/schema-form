# Schema Form Plugin for Obsidian

Dynamic form generation from YAML/JSON schemas for Obsidian. This plugin allows you to capture structured data through a user-friendly modal interface, which can then be used by other plugins or scripts via a global API.

## Features

- ✨ **Schema-Driven UI:** Define your forms in simple Markdown files using YAML or JSON.
- 📝 **Multiple Field Types:**
  - Text and Text Area
  - Numbers (with min/max/step)
  - Toggles (Boolean)
  - Select (Dropdown)
  - Multi-Select (Checkboxes)
  - Date Picker
- ✅ **Built-in Validation:** Required fields, regex patterns, and range checks.
- 🎨 **Obsidian-Themed:** Seamlessly integrates with Obsidian's look and feel.
- 🔧 **Global API:** Programmable access via `window.scf`.

## Usage

### 1. Configure Schema Directory

In the plugin settings, specify the folder where your schema files are stored.

### 2. Create a Schema

Create a `.md` file in your schema folder with a YAML code block:

```yaml
fields:
  - name: task_name
    type: TEXT
    label: Task Name
    required: true
    placeholder: "What needs to be done?"

  - name: priority
    type: SELECT
    label: Priority
    options: ["Low", "Medium", "High"]
    default: "Medium"

  - name: tags
    type: MULTI_SELECT
    label: Tags
    options: ["Work", "Personal", "Urgent", "Later"]

  - name: due_date
    type: DATE
    label: Due Date
    required: false

  - name: completed
    type: TOGGLE
    label: Completed
    default: false
```

### 3. Trigger the Form

You can trigger the form using the "Schema Form: Open Form" command, or programmatically:

```javascript
const result = await window.scf.triggerForm("task-schema");
if (result) {
  console.log("Form submitted:", result);
}
```

## Development

### Setup

```bash
bun install
```

### Build & Watch

```bash
bun run dev    # Development mode (watch)
bun run build  # Production build
```

### Quality Control

```bash
bun run check  # Lint and format check
bun run test   # Run tests
```

## License

MIT
