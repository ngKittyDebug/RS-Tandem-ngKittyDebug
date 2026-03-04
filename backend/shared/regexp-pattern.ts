const PASSWORD_PATTERN =
  /^(?!\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]{8,}(?<!\s)$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+.[^\s@]{2,}$/;

const USER_PATTERN = /^\S{3,20}$/;

export { PASSWORD_PATTERN, EMAIL_PATTERN, USER_PATTERN };
