import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateAuthDto } from '../dto/update-auth.dto';

describe('UpdateAuthDto', () => {
  it('should accept partial data (only email)', () => {
    const dto = plainToClass(UpdateAuthDto, {
      email: 'updated@gmail.com',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept partial data (only password)', () => {
    const dto = plainToClass(UpdateAuthDto, {
      password: 'newPassword123',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept both fields', () => {
    const dto = plainToClass(UpdateAuthDto, {
      email: 'updated@gmail.com',
      password: 'newPassword123',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept empty object', () => {
    const dto = plainToClass(UpdateAuthDto, {});

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate email format when provided', () => {
    const dto = plainToClass(UpdateAuthDto, {
      email: 'invalid-email',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should validate password is string when provided', () => {
    const dto = plainToClass(UpdateAuthDto, {
      password: 12345,
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
  });
});
