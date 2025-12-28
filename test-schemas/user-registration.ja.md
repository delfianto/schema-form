# ユーザー登録フォーム (Japanese)

これは、すべてのフィールドタイプと検証ルールを示す包括的なテストスキーマです。

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: あなたは人間ですか？
    required: true
  - type: TEXT
    name: email
    label: メールアドレス
    description: 有効なメール形式である必要があります
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: 電話番号
    description: 電話番号である必要があります - 形式 (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: ユーザー名
    description: "3〜20文字、英数字のみ"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: 年齢
    description: 13歳から120歳の間である必要があります
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: 年収
    description: "任意、入力する場合は最低$15,000"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: 国
    description: あなたの国を選択してください
    required: true
    default: 日本
    options:
      - アメリカ合衆国
      - カナダ
      - イギリス
      - オーストラリア
      - ドイツ
      - フランス
      - 日本
      - その他
  - type: SELECT
    name: skill_level
    label: プログラミングスキルレベル
    description: プログラミングスキルをどのように評価しますか？
    required: true
    default: 初級
    options:
      - 初級
      - 中級
      - 上級
      - 専門家
  - type: TEXT
    name: full_name
    label: 氏名
    description: 姓と名が必要です
    required: true
    default: 山田太郎
```
