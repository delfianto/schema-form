# 用户注册表单 (Chinese Simplified)

这是一个展示所有字段类型和验证规则的综合测试架构。

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: 您是人类吗？
    required: true
  - type: TEXT
    name: email
    label: 电子邮件地址
    description: 必须是有效的电子邮件格式
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: 电话号码
    description: 必须是电话号码 - 格式 (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: 用户名
    description: "3-20个字符，仅限字母和数字"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: 年龄
    description: 必须在13到120之间
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: 年薪
    description: "可选，如果填写则最低$15,000"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: 国家
    description: 选择您的国家
    required: true
    default: 中国
    options:
      - 美国
      - 加拿大
      - 英国
      - 澳大利亚
      - 德国
      - 法国
      - 日本
      - 中国
      - 其他
  - type: SELECT
    name: skill_level
    label: 编程技能水平
    description: 您如何评价自己的编程技能？
    required: true
    default: 初学者
    options:
      - 初学者
      - 中级
      - 高级
      - 专家
  - type: TEXT
    name: full_name
    label: 全名
    description: 需要提供名和姓
    required: true
    default: 张伟
```
