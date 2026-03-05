import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoginAuthDto } from '../dto/login-auth.dto';

const createDto = (overrides: Partial<LoginAuthDto> = {}) =>
  plainToClass(LoginAuthDto, {
    email: 'test@gmail.com',
    password: 'Password123',
    ...overrides,
  });

describe('LoginAuthDto', () => {
  it('should create a valid DTO with email and password', () => {
    expect(validateSync(createDto())).toHaveLength(0);
  });

  it('should create a valid DTO with username and password', () => {
    const dto = createDto({
      email: undefined as unknown as string,
      username: 'Alex',
    });
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('should validate email format when email is provided', () => {
    const dto = createDto({ email: 'invalid-email' });
    const errors = validateSync(dto);

    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should validate email is not empty when email is provided', () => {
    const dto = createDto({ email: '' });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError?.constraints).toHaveProperty('matches');
  });

  it('should validate username is not empty when username is provided', () => {
    const dto = createDto({
      username: '',
      email: undefined as unknown as string,
    });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
    const usernameError = errors.find((e) => e.property === 'username');
    expect(usernameError?.constraints).toHaveProperty('matches');
  });

  it('should validate password is not empty', () => {
    const dto = createDto({ password: '' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should validate password is a string', () => {
    const dto = createDto({ password: 12345678 as unknown as string });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
  });

  it('should allow empty email when username is provided', () => {
    const dto = createDto({ email: '', username: 'Alex' });
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('should allow empty username when email is provided', () => {
    const dto = createDto({ username: '' });
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('should fail when both email and username are empty', () => {
    const dto = createDto({ email: '', username: '' });
    expect(validateSync(dto).length).toBeGreaterThanOrEqual(1);
  });

  it('should pass with valid email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'test+tag@gmail.com',
    ];

    validEmails.forEach((email) => {
      expect(validateSync(createDto({ email }))).toHaveLength(0);
    });
  });

  it('should require password in all cases', () => {
    const dto = createDto({ password: undefined as unknown as string });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
  });
});
