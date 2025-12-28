# Formulario de Registro de Usuario (Spanish)

Este es un esquema de prueba integral que demuestra todos los tipos de campos y reglas de validación.

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: ¿Eres humano?
    required: true
  - type: TEXT
    name: email
    label: Dirección de Correo Electrónico
    description: Debe ser un formato de correo electrónico válido
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: Número de Teléfono
    description: Debe ser un número de teléfono - Formato (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: Nombre de Usuario
    description: "3-20 caracteres, solo letras y números"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: Edad
    description: Debe estar entre 13 y 120
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: Salario Anual
    description: "Opcional, mínimo $15,000 si se proporciona"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: País
    description: Seleccione su país
    required: true
    default: España
    options:
      - Estados Unidos
      - Canadá
      - Reino Unido
      - Australia
      - Alemania
      - Francia
      - Japón
      - España
      - México
      - Argentina
      - Otro
  - type: SELECT
    name: skill_level
    label: Nivel de Habilidad en Programación
    description: ¿Cómo calificaría sus habilidades de programación?
    required: true
    default: Principiante
    options:
      - Principiante
      - Intermedio
      - Avanzado
      - Experto
  - type: TEXT
    name: full_name
    label: Nombre Completo
    description: Se requiere nombre y apellido
    required: true
    default: Juan Pérez
```
