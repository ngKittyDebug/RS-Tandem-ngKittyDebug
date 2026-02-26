import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateAuthDto } from '../dto/create-auth.dto';

describe('CreateAuthDto', () => {
  it('should create a valid DTO with correct data', () => {
    const dto = plainToClass(CreateAuthDto, {
      email: 'test@gmail.com',
      password: 'password123',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate email format', () => {
    const dto = plainToClass(CreateAuthDto, {
      email: 'invalid-email',
      password: 'password123',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should validate email is not empty', () => {
    const dto = plainToClass(CreateAuthDto, {
      email: '',
      password: 'password123',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should validate password is not empty', () => {
    const dto = plainToClass(CreateAuthDto, {
      email: 'test@gmail.com',
      password: '',
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should validate password is a string', () => {
    const dto = plainToClass(CreateAuthDto, {
      email: 'test@gmail.com',
      password: 12345,
    });

    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
  });

  it('should validate both fields are required', () => {
    const dto = plainToClass(CreateAuthDto, {});

    const errors = validateSync(dto);
    expect(errors).toHaveLength(2);
  });

  it('should pass with valid email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'test+tag@gmail.com',
    ];

    validEmails.forEach((email) => {
      const dto = plainToClass(CreateAuthDto, {
        email,
        password: 'password123',
      });
      const errors = validateSync(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
