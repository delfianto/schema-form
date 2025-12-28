# 사용자 등록 양식 (Korean)

이것은 모든 필드 유형과 유효성 검사 규칙을 보여주는 포괄적인 테스트 스키마입니다.

```yaml
fields:
  - type: TOGGLE
    name: is_human
    label: 당신은 인간입니까?
    required: true
  - type: TEXT
    name: email
    label: 이메일 주소
    description: 유효한 이메일 형식이어야 합니다
    required: true
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  - type: TEXT
    name: phone
    label: 전화번호
    description: 전화번호여야 합니다 - 형식 (123) 456-7890
    required: false
    regex: '^\(\d{3}\) \d{3}-\d{4}$'
  - type: TEXT
    name: username
    label: 사용자 이름
    description: "3-20자, 영문자와 숫자만 가능"
    required: true
    regex: "^[a-zA-Z0-9]{3,20}$"
  - type: NUMBER
    name: age
    label: 나이
    description: 13세에서 120세 사이여야 합니다
    required: true
    min: 13
    max: 120
    default: 25
  - type: NUMBER
    name: salary
    label: 연봉
    description: "선택 사항, 입력하는 경우 최소 $15,000"
    required: false
    min: 15000
    max: 1000000
  - type: SELECT
    name: country
    label: 국가
    description: 국가를 선택하세요
    required: true
    default: 대한민국
    options:
      - 미국
      - 캐나다
      - 영국
      - 호주
      - 독일
      - 프랑스
      - 일본
      - 대한민국
      - 기타
  - type: SELECT
    name: skill_level
    label: 프로그래밍 실력 수준
    description: 프로그래밍 실력을 어떻게 평가하시겠습니까?
    required: true
    default: 초급
    options:
      - 초급
      - 중급
      - 고급
      - 전문가
  - type: TEXT
    name: full_name
    label: 전체 이름
    description: 성과 이름이 필요합니다
    required: true
    default: 김철수
```
