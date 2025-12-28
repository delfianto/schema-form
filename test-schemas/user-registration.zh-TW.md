# 使用者註冊表單 (Chinese Traditional)

這是一個展示所有欄位類型和驗證規則的綜合測試架構。

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: 您是人類嗎？
    required: true
  - type: TEXT
    name: email
    label: 電子郵件地址
    description: 必須是有效的電子郵件格式
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: 電話號碼
    description: 必須是電話號碼 - 格式 (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: 使用者名稱
    description: "3-20個字元，僅限字母和數字"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: 年齡
    description: 必須在13到120之間
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: 年薪
    description: "可選，如果填寫則最低$15,000"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: 國家
    description: 選擇您的國家
    required: true
    default: 台灣
    options:
      - 美國
      - 加拿大
      - 英國
      - 澳洲
      - 德國
      - 法國
      - 日本
      - 台灣
      - 中國
      - 其他
  - type: SELECT
    name: skill_level
    label: 程式設計技能水平
    description: 您如何評價自己的程式設計技能？
    required: true
    default: 初學者
    options:
      - 初學者
      - 中級
      - 高級
      - 專家
  - type: TEXT
    name: full_name
    label: 全名
    description: 需要提供名和姓
    required: true
    default: 王小明
```
