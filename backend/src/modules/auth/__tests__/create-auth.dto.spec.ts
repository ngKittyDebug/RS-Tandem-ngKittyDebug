import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateAuthDto } from '../dto/create-auth.dto';

const validDtoData = {
  email: 'test@gmail.com',
  password: 'Password123',
  username: 'Alex',
};

const createDto = (overrides: Partial<typeof validDtoData> = {}) =>
  plainToClass(CreateAuthDto, { ...validDtoData, ...overrides });

describe('CreateAuthDto', () => {
  it('should create a valid DTO with correct data', () => {
    const dto = createDto();
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('should validate email format', () => {
    const dto = createDto({ email: 'invalid-email' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should validate email is not empty', () => {
    const dto = createDto({ email: '' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
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

  it('should validate all fields are required', () => {
    const dto = createDto({ email: '', password: '', username: '' });
    expect(validateSync(dto)).toHaveLength(3);
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
});
