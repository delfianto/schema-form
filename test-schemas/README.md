# Test Schema Examples - Multilingual User Registration Forms

This directory contains translated versions of a comprehensive test schema in **9 languages**, demonstrating the Schema Form plugin's internationalization (i18n) capabilities.

## 📁 Available Schemas

| Language | File | Locale Code | Default Country |
|----------|------|-------------|-----------------|
| 🇬🇧 English | `user-registration.en.md` | `en` | United States |
| 🇮🇩 Indonesian | `user-registration.id.md` | `id` | Indonesia |
| 🇯🇵 Japanese | `user-registration.ja.md` | `ja` | 日本 (Japan) |
| 🇨🇳 Chinese (Simplified) | `user-registration.zh.md` | `zh` | 中国 (China) |
| 🇪🇸 Spanish | `user-registration.es.md` | `es` | España (Spain) |
| 🇫🇷 French | `user-registration.fr.md` | `fr` | France |
| 🇩🇪 German | `user-registration.de.md` | `de` | Deutschland (Germany) |
| 🇰🇷 Korean | `user-registration.ko.md` | `ko` | 대한민국 (South Korea) |
| 🇧🇷 Portuguese (Brazil) | `user-registration.pt-BR.md` | `pt-BR` | Brasil (Brazil) |

## 🌍 How the i18n System Works

### Automatic Locale Resolution

The Schema Form plugin automatically resolves schemas based on your current locale setting with the following fallback chain:

1. **Requested locale** (e.g., `user-registration.id.md` for Indonesian)
2. **Base language** (e.g., `user-registration.en.md` for `en-US`)
3. **Default locale** (usually `en`)
4. **Legacy format** (`user-registration.md` without locale)

### Example Usage

If your Obsidian is set to Indonesian:
```typescript
// Plugin will automatically load:
// 1. Try: user-registration.id.md ✅ Found!
// 2. Skip fallbacks since Indonesian version exists

const schema = await schemaLoader.loadSchema('user-registration', 'id');
// Returns Indonesian labels and descriptions
```

If your Obsidian is set to Italian (not yet translated):
```typescript
// Plugin will fallback through:
// 1. Try: user-registration.it.md ❌ Not found
// 2. Try: user-registration.en.md ✅ Found!

const schema = await schemaLoader.loadSchema('user-registration', 'it');
// Returns English labels (fallback) with a notice
```

## 📝 Schema Features Demonstrated

Each translated schema includes:

### Field Types
- ✅ **TOGGLE** - Boolean yes/no questions
- ✅ **TEXT** - Text input with regex validation
- ✅ **NUMBER** - Numeric input with min/max constraints
- ✅ **SELECT** - Dropdown selection with options

### Validation Rules
- **Required fields** - `required: true`
- **Regex patterns** - Email, phone number, username formats
- **Numeric ranges** - Age (13-120), Salary (15k-1M)
- **String length** - Username (3-20 characters)

### Localized Elements

#### ✅ Translated
- Field **labels** (e.g., "Email Address" → "Alamat Email")
- Field **descriptions** (e.g., "Must be valid format" → "Harus dalam format yang valid")
- **Option values** for dropdowns (e.g., "Beginner" → "Pemula")
- **Default values** (e.g., "John Doe" → "Budi Santoso")
- **Country defaults** (matches locale - Indonesia for `id`, Japan for `ja`, etc.)

#### ❌ NOT Translated (Technical)
- Field **names** (`email`, `username`, etc.) - used as data keys
- Field **types** (`TEXT`, `NUMBER`, etc.) - system identifiers
- **Regex patterns** - technical validation rules
- **Min/max values** - numeric constraints

## 🎯 Testing the i18n Implementation

### 1. Set Your Locale in Plugin Settings

Go to Settings → Schema Form → Language/Locale:
- Choose "🌐 Auto-detect from Obsidian" to use your Obsidian language
- Or manually select a specific locale

### 2. Copy Test Schemas to Your Vault

```bash
# Copy all test schemas to your vault's schema directory
cp test-schemas/user-registration.*.md /path/to/your/vault/schemas/
```

### 3. Trigger the Form

The plugin will automatically load the correct language version based on your settings!

### 4. Observe Localized Error Messages

When you submit the form with invalid data, you'll see error messages in your selected language:

| Locale | "This field is required" |
|--------|--------------------------|
| English | This field is required |
| Indonesian | Bidang ini wajib diisi |
| Japanese | この項目は必須です |
| Chinese | 此字段为必填项 |
| Spanish | Este campo es obligatorio |
| French | Ce champ est obligatoire |
| German | Dieses Feld ist erforderlich |
| Korean | 이 필드는 필수입니다|
| Portuguese | Este campo é obrigatório |

## 🔧 Creating Your Own Translations

### Translation Checklist

- [ ] File named with correct locale code (e.g., `.id.md`, `.ja.md`)
- [ ] All `label` fields translated
- [ ] All `description` fields translated
- [ ] User-facing `options` translated
- [ ] `default` values localized if appropriate
- [ ] `name` fields kept in English (technical identifiers)
- [ ] `regex` patterns unchanged (technical rules)
- [ ] `required`, `min`, `max` kept as-is (technical constraints)

### Example: Creating a Dutch Translation

```yaml
# user-registration.nl.md
fields:
  - type: TEXT
    name: email              # ❌ DON'T translate (technical)
    label: E-mailadres       # ✅ Translate (user-facing)
    description: Moet een geldig e-mailformaat zijn  # ✅ Translate
    required: true           # ❌ DON'T translate (technical)
    regex: '^[a-z]+@[a-z]+$' # ❌ DON'T translate (technical)
```

## 📊 Translation Status

| Language | Labels | Descriptions | Options | Defaults | Status |
|----------|--------|--------------|---------|----------|--------|
| English | ✅ | ✅ | ✅ | ✅ | Complete |
| Indonesian | ✅ | ✅ | ✅ | ✅ | Complete |
| Japanese | ✅ | ✅ | ✅ | ✅ | Complete |
| Chinese (Simplified) | ✅ | ✅ | ✅ | ✅ | Complete |
| Spanish | ✅ | ✅ | ✅ | ✅ | Complete |
| French | ✅ | ✅ | ✅ | ✅ | Complete |
| German | ✅ | ✅ | ✅ | ✅ | Complete |
| Korean | ✅ | ✅ | ✅ | ✅ | Complete |
| Portuguese (Brazil) | ✅ | ✅ | ✅ | ✅ | Complete |

## 🤝 Contributing Translations

Want to add support for more languages? We'd love your help!

1. Check if your locale is supported in `src/i18n/LocaleRegistry.ts`
2. Create a new schema file: `user-registration.{locale}.md`
3. Translate labels, descriptions, and options
4. Keep technical fields in English
5. Test with the plugin
6. Submit a pull request!

## 📚 Additional Resources

- [i18n Implementation Guide](../ACTION_PLAN_I18N.md) - Full technical documentation
- [Locale Registry](../src/i18n/LocaleRegistry.ts) - Supported locales
- [Error Messages](../src/i18n/messages.ts) - Validation message translations

---

**Note**: These are test schemas for demonstration purposes. Feel free to adapt them for your actual use cases!
