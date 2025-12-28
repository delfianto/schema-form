# Benutzerregistrierungsformular (German)

Dies ist ein umfassendes Testschema, das alle Feldtypen und Validierungsregeln demonstriert.

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: Sind Sie ein Mensch?
    required: true
  - type: TEXT
    name: email
    label: E-Mail-Adresse
    description: Muss ein gültiges E-Mail-Format sein
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: Telefonnummer
    description: Muss eine Telefonnummer sein - Format (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: Benutzername
    description: "3-20 Zeichen, nur Buchstaben und Zahlen"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: Alter
    description: Muss zwischen 13 und 120 liegen
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: Jahresgehalt
    description: "Optional, mindestens 15.000 $ falls angegeben"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: Land
    description: Wählen Sie Ihr Land
    required: true
    default: Deutschland
    options:
      - Vereinigte Staaten
      - Kanada
      - Vereinigtes Königreich
      - Australien
      - Deutschland
      - Frankreich
      - Japan
      - Andere
  - type: SELECT
    name: skill_level
    label: Programmierkenntnisse
    description: Wie würden Sie Ihre Programmierkenntnisse bewerten?
    required: true
    default: Anfänger
    options:
      - Anfänger
      - Mittelstufe
      - Fortgeschritten
      - Experte
  - type: TEXT
    name: full_name
    label: Vollständiger Name
    description: Vor- und Nachname erforderlich
    required: true
    default: Max Mustermann
```
