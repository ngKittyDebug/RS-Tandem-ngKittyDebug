import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateUserPassword } from '../dto/update-user-pass.dto';

const createDto = (overrides: Partial<UpdateUserPassword> = {}) =>
  plainToClass(UpdateUserPassword, {
    oldPassword: 'OldPassword123!',
    newPassword: 'NewPassword123!',
    ...overrides,
  });

describe('UpdateUserPassword', () => {
  it('should pass validation with valid data', () => {
    const dto = createDto();

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when oldPassword is missing', () => {
    const dto = plainToClass(UpdateUserPassword, {
      newPassword: 'NewPassword123!',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('oldPassword');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when oldPassword is empty string', () => {
    const dto = createDto({ oldPassword: '' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('oldPassword');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when newPassword is missing', () => {
    const dto = plainToClass(UpdateUserPassword, {
      oldPassword: 'OldPassword123!',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('newPassword');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when newPassword is empty string', () => {
    const dto = createDto({ newPassword: '' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('newPassword');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should pass validation even when newPassword is less than 8 characters (no MinLength validator in DTO)', () => {
    const dto = createDto({ newPassword: 'Short1!' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
  });

  it('should pass validation when newPassword is exactly 8 characters', () => {
    const dto = createDto({ newPassword: 'Pass123!' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with long newPassword', () => {
    const dto = createDto({ newPassword: 'VeryLongPassword123!' });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when non-string value is provided for oldPassword', () => {
    const dto = createDto({ oldPassword: 12345 as unknown as string });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('oldPassword');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when non-string value is provided for newPassword', () => {
    const dto = createDto({ newPassword: 12345 as unknown as string });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('newPassword');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should pass validation with special characters in passwords', () => {
    const dto = createDto({
      oldPassword: 'Old@Pass#123!',
      newPassword: 'New@Pass#456!',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with numbers in passwords', () => {
    const dto = createDto({
      oldPassword: 'OldPass123',
      newPassword: 'NewPass456',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with underscores in passwords', () => {
    const dto = createDto({
      oldPassword: 'Old_Password_123',
      newPassword: 'New_Password_456',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });
});
