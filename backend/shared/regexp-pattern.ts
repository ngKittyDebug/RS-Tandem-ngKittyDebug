const PASSWORD_PATTERN =
  /^(?!\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]{8,}(?<!\s)$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const USER_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

export { PASSWORD_PATTERN, EMAIL_PATTERN, USER_PATTERN };
