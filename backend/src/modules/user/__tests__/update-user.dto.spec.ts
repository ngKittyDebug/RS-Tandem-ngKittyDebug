import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UserDto } from '../dto/update-user.dto';

const createDto = (overrides: Partial<UserDto> = {}) =>
  plainToClass(UserDto, { password: 'Password123!', ...overrides });

describe('UserDto', () => {
  it('should pass validation with valid data', () => {
    const dto = createDto({
      username: 'validuser',
      email: 'valid@example.com',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with only password (username and email are optional)', () => {
    const dto = createDto();

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with only username and password', () => {
    const dto = createDto({ username: 'validuser' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with only email and password', () => {
    const dto = createDto({ email: 'valid@example.com' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when password is missing', () => {
    const dto = plainToClass(UserDto, {
      username: 'validuser',
      email: 'valid@example.com',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when password is empty string', () => {
    const dto = createDto({ password: '' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when username is too short (less than 3 chars)', () => {
    const dto = createDto({ username: 'ab' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should fail validation when username is too long (more than 20 chars)', () => {
    const dto = createDto({ username: 'verylongusernamethatisinvalid' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should fail validation when username contains spaces', () => {
    const dto = createDto({ username: 'invalid user' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should fail validation when email is invalid', () => {
    const dto = createDto({ email: 'invalid-email' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should fail validation when email is missing @ symbol', () => {
    const dto = createDto({ email: 'invalidemail.com' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should pass validation with valid username containing underscores', () => {
    const dto = createDto({ username: 'valid_user_123' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with valid username containing numbers', () => {
    const dto = createDto({ username: 'user123' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when username is exactly 2 characters', () => {
    const dto = createDto({ username: 'ab' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
  });

  it('should pass validation when username is exactly 3 characters', () => {
    const dto = createDto({ username: 'abc' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation when username is exactly 20 characters', () => {
    const dto = createDto({ username: 'abcdefghijklmnopqrst' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when username is 21 characters', () => {
    const dto = createDto({ username: 'abcdefghijklmnopqrstu' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
  });

  it('should fail validation when non-string value is provided for username', () => {
    const dto = createDto({ username: 123 as unknown as string });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('username');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when non-string value is provided for email', () => {
    const dto = createDto({ email: 12345 as unknown as string });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
