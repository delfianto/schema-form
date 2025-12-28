import type { SupportedLocale } from "./types";

export interface ErrorMessages {
  required: string;
  invalidEmail: string;
  invalidNumber: string;
  minLength: (min: number) => string;
  maxLength: (max: number) => string;
  minValue: (min: number) => string;
  maxValue: (max: number) => string;
  pattern: string;
  invalidDate: string;
}

const messages: Record<SupportedLocale, ErrorMessages> = {
  en: {
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidNumber: "Please enter a valid number",
    minLength: (min) => `Minimum length is ${min} characters`,
    maxLength: (max) => `Maximum length is ${max} characters`,
    minValue: (min) => `Minimum value is ${min}`,
    maxValue: (max) => `Maximum value is ${max}`,
    pattern: "Invalid format",
    invalidDate: "Please enter a valid date",
  },

  id: {
    required: "Bidang ini wajib diisi",
    invalidEmail: "Masukkan alamat email yang valid",
    invalidNumber: "Masukkan angka yang valid",
    minLength: (min) => `Panjang minimum adalah ${min} karakter`,
    maxLength: (max) => `Panjang maksimum adalah ${max} karakter`,
    minValue: (min) => `Nilai minimum adalah ${min}`,
    maxValue: (max) => `Nilai maksimum adalah ${max}`,
    pattern: "Format tidak valid",
    invalidDate: "Masukkan tanggal yang valid",
  },

  ja: {
    required: "この項目は必須です",
    invalidEmail: "有効なメールアドレスを入力してください",
    invalidNumber: "有効な数値を入力してください",
    minLength: (min) => `最小長は${min}文字です`,
    maxLength: (max) => `最大長は${max}文字です`,
    minValue: (min) => `最小値は${min}です`,
    maxValue: (max) => `最大値は${max}です`,
    pattern: "無効な形式",
    invalidDate: "有効な日付を入力してください",
  },

  zh: {
    required: "此字段为必填项",
    invalidEmail: "请输入有效的电子邮件地址",
    invalidNumber: "请输入有效的数字",
    minLength: (min) => `最小长度为${min}个字符`,
    maxLength: (max) => `最大长度为${max}个字符`,
    minValue: (min) => `最小值为${min}`,
    maxValue: (max) => `最大值为${max}`,
    pattern: "格式无效",
    invalidDate: "请输入有效的日期",
  },

  "zh-TW": {
    required: "此欄位為必填項",
    invalidEmail: "請輸入有效的電子郵件地址",
    invalidNumber: "請輸入有效的數字",
    minLength: (min) => `最小長度為${min}個字元`,
    maxLength: (max) => `最大長度為${max}個字元`,
    minValue: (min) => `最小值為${min}`,
    maxValue: (max) => `最大值為${max}`,
    pattern: "格式無效",
    invalidDate: "請輸入有效的日期",
  },

  ko: {
    required: "이 필드는 필수입니다",
    invalidEmail: "유효한 이메일 주소를 입력하세요",
    invalidNumber: "유효한 숫자를 입력하세요",
    minLength: (min) => `최소 길이는 ${min}자입니다`,
    maxLength: (max) => `최대 길이는 ${max}자입니다`,
    minValue: (min) => `최소값은 ${min}입니다`,
    maxValue: (max) => `최대값은 ${max}입니다`,
    pattern: "유효하지 않은 형식",
    invalidDate: "유효한 날짜를 입력하세요",
  },

  es: {
    required: "Este campo es obligatorio",
    invalidEmail: "Por favor ingrese una dirección de correo válida",
    invalidNumber: "Por favor ingrese un número válido",
    minLength: (min) => `La longitud mínima es ${min} caracteres`,
    maxLength: (max) => `La longitud máxima es ${max} caracteres`,
    minValue: (min) => `El valor mínimo es ${min}`,
    maxValue: (max) => `El valor máximo es ${max}`,
    pattern: "Formato inválido",
    invalidDate: "Por favor ingrese una fecha válida",
  },

  fr: {
    required: "Ce champ est obligatoire",
    invalidEmail: "Veuillez saisir une adresse e-mail valide",
    invalidNumber: "Veuillez saisir un nombre valide",
    minLength: (min) => `La longueur minimale est de ${min} caractères`,
    maxLength: (max) => `La longueur maximale est de ${max} caractères`,
    minValue: (min) => `La valeur minimale est ${min}`,
    maxValue: (max) => `La valeur maximale est ${max}`,
    pattern: "Format invalide",
    invalidDate: "Veuillez saisir une date valide",
  },

  de: {
    required: "Dieses Feld ist erforderlich",
    invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    invalidNumber: "Bitte geben Sie eine gültige Zahl ein",
    minLength: (min) => `Die Mindestlänge beträgt ${min} Zeichen`,
    maxLength: (max) => `Die Maximallänge beträgt ${max} Zeichen`,
    minValue: (min) => `Der Mindestwert beträgt ${min}`,
    maxValue: (max) => `Der Maximalwert beträgt ${max}`,
    pattern: "Ungültiges Format",
    invalidDate: "Bitte geben Sie ein gültiges Datum ein",
  },

  "pt-BR": {
    required: "Este campo é obrigatório",
    invalidEmail: "Por favor insira um endereço de e-mail válido",
    invalidNumber: "Por favor insira um número válido",
    minLength: (min) => `O comprimento mínimo é de ${min} caracteres`,
    maxLength: (max) => `O comprimento máximo é de ${max} caracteres`,
    minValue: (min) => `O valor mínimo é ${min}`,
    maxValue: (max) => `O valor máximo é ${max}`,
    pattern: "Formato inválido",
    invalidDate: "Por favor insira uma data válida",
  },
};

export function getErrorMessages(locale: SupportedLocale): ErrorMessages {
  return messages[locale] ?? messages.en;
}
