# User Registration Form (English)

This is a comprehensive test schema demonstrating all field types and validation rules.

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: Are you human?
    required: true
  - type: TEXT
    name: email
    label: Email Address
    description: Must be a valid email format
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: Phone Number
    description: Must be a phone number - Format (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: Username
    description: "3-20 characters, letters and numbers only"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: Age
    description: Must be between 13 and 120
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: Annual Salary
    description: "Optional, minimum $15,000 if provided"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: Country
    description: Select your country
    required: true
    default: United States
    options:
      - United States
      - Canada
      - United Kingdom
      - Australia
      - Germany
      - France
      - Japan
      - Other
  - type: SELECT
    name: skill_level
    label: Programming Skill Level
    description: How would you rate your programming skills?
    required: true
    default: Beginner
    options:
      - Beginner
      - Intermediate
      - Advanced
      - Expert
  - type: TEXT
    name: full_name
    label: Full Name
    description: First and last name required
    required: true
    default: John Doe
```
