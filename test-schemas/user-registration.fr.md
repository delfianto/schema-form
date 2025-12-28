# Formulaire d'Inscription Utilisateur (French)

Ceci est un schéma de test complet démontrant tous les types de champs et règles de validation.

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: Êtes-vous humain ?
    required: true
  - type: TEXT
    name: email
    label: Adresse E-mail
    description: Doit être un format d'e-mail valide
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: Numéro de Téléphone
    description: Doit être un numéro de téléphone - Format (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: Nom d'Utilisateur
    description: "3-20 caractères, lettres et chiffres uniquement"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: Âge
    description: Doit être entre 13 et 120
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: Salaire Annuel
    description: "Facultatif, minimum 15 000 $ si fourni"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: Pays
    description: Sélectionnez votre pays
    required: true
    default: France
    options:
      - États-Unis
      - Canada
      - Royaume-Uni
      - Australie
      - Allemagne
      - France
      - Japon
      - Autre
  - type: SELECT
    name: skill_level
    label: Niveau de Compétence en Programmation
    description: Comment évalueriez-vous vos compétences en programmation ?
    required: true
    default: Débutant
    options:
      - Débutant
      - Intermédiaire
      - Avancé
      - Expert
  - type: TEXT
    name: full_name
    label: Nom Complet
    description: Prénom et nom de famille requis
    required: true
    default: Pierre Dupont
```
