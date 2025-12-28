# Formulário de Cadastro de Usuário (Portuguese - Brazil)

Este é um esquema de teste abrangente que demonstra todos os tipos de campos e regras de validação.

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: Você é humano?
    required: true
  - type: TEXT
    name: email
    label: Endereço de E-mail
    description: Deve ser um formato de e-mail válido
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: Número de Telefone
    description: Deve ser um número de telefone - Formato (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: Nome de Usuário
    description: "3-20 caracteres, apenas letras e números"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: Idade
    description: Deve estar entre 13 e 120
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: Salário Anual
    description: "Opcional, mínimo R$ 15.000 se fornecido"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: País
    description: Selecione seu país
    required: true
    default: Brasil
    options:
      - Estados Unidos
      - Canadá
      - Reino Unido
      - Austrália
      - Alemanha
      - França
      - Japão
      - Brasil
      - Portugal
      - Outro
  - type: SELECT
    name: skill_level
    label: Nível de Habilidade em Programação
    description: Como você avaliaria suas habilidades de programação?
    required: true
    default: Iniciante
    options:
      - Iniciante
      - Intermediário
      - Avançado
      - Especialista
  - type: TEXT
    name: full_name
    label: Nome Completo
    description: Nome e sobrenome obrigatórios
    required: true
    default: João Silva
```
