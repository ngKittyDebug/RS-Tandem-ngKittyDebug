import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoginAuthDto } from '../dto/login-auth.dto';

const createDto = (overrides: Partial<LoginAuthDto> = {}): LoginAuthDto =>
  plainToClass(LoginAuthDto, {
    email: 'test@example.com',
    username: 'testuser',
    password: 'Password123!',
    ...overrides,
  });

describe('LoginAuthDto', () => {
  it('should create a valid DTO with correct email and password', () => {
    const dto = createDto({ username: '' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
  });

  it('should create a valid DTO with correct username and password', () => {
    const dto = createDto({ email: '' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate email format', () => {
    const dto = createDto({ username: '', email: 'invalid-email' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should validate email is not empty when username is not provided', () => {
    const dto = createDto({ username: '', email: '' });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should validate username is not empty when email is not provided', () => {
    const dto = createDto({ email: '', username: '' });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'username')).toBe(true);
  });

  it('should validate username length (min 3 characters)', () => {
    const dto = createDto({ email: '', username: 'ab' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should validate username length (max 20 characters)', () => {
    const dto = createDto({
      email: '',
      username: 'verylongusernamethatisinvalid',
    });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should validate username does not contain spaces', () => {
    const dto = createDto({ email: '', username: 'invalid user' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should validate password is not empty', () => {
    const dto = createDto({ password: '' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should pass with valid password formats', () => {
    const validPasswords = [
      'Password123!',
      'StrongPass1!',
      'MyP@ssw0rd',
      'Test1234!',
    ];

    validPasswords.forEach((password) => {
      const dto = createDto({ password, username: '' });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });
  });

  it('should pass with valid email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'test+tag@gmail.com',
    ];

    validEmails.forEach((email) => {
      const dto = createDto({ email, username: '' });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });
  });

  it('should pass with valid username formats', () => {
    const validUsernames = [
      'abc',
      'user123',
      'valid_user',
      'abcdefghijklmnopqrst',
    ];

    validUsernames.forEach((username) => {
      const dto = createDto({ username, email: '' });
      const errors = validateSync(dto);

      expect(errors).toHaveLength(0);
    });
  });

  it('should fail when both email and username are empty', () => {
    const dto = plainToClass(LoginAuthDto, {
      email: '',
      username: '',
      password: 'Password123!',
    });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when password is non-string value', () => {
    const dto = createDto({ password: 12345 as unknown as string });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail when email is non-string value', () => {
    const dto = createDto({ email: 12345 as unknown as string, username: '' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail when username is non-string value', () => {
    const dto = createDto({ username: 12345 as unknown as string, email: '' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
