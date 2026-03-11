import { ConfigService } from '@nestjs/config';
import { getJwtConfig } from '../config/jwt.config';

describe('getJwtConfig', () => {
  let configServiceMock: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configServiceMock = {
      getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(getJwtConfig).toBeDefined();
  });

  it('should return JwtModuleOptions with secret and verifyOptions', () => {
    (configServiceMock.getOrThrow as jest.Mock).mockReturnValue(
      'test-secret-key',
    );

    const result = getJwtConfig(configServiceMock);

    expect(result).toEqual({
      secret: 'test-secret-key',
      verifyOptions: {
        ignoreExpiration: false,
      },
    });
  });

  it('should call getOrThrow with JWT_SECRET_KEY', () => {
    (configServiceMock.getOrThrow as jest.Mock).mockReturnValue(
      'test-secret-key',
    );

    getJwtConfig(configServiceMock);

    expect(configServiceMock.getOrThrow).toHaveBeenCalledWith('JWT_SECRET_KEY');
  });

  it('should set ignoreExpiration to false in verifyOptions', () => {
    (configServiceMock.getOrThrow as jest.Mock).mockReturnValue(
      'test-secret-key',
    );

    const result = getJwtConfig(configServiceMock);

    expect(result.verifyOptions?.ignoreExpiration).toBe(false);
  });

  it('should throw error if JWT_SECRET_KEY is not configured', () => {
    (configServiceMock.getOrThrow as jest.Mock).mockImplementation(() => {
      throw new Error('JWT_SECRET_KEY is not configured');
    });

    expect(() => getJwtConfig(configServiceMock)).toThrow(
      'JWT_SECRET_KEY is not configured',
    );
  });

  it('should return different secret for different config values', () => {
    (configServiceMock.getOrThrow as jest.Mock).mockReturnValueOnce('secret-1');
    (configServiceMock.getOrThrow as jest.Mock).mockReturnValueOnce('secret-2');

    const result1 = getJwtConfig(configServiceMock);
    const result2 = getJwtConfig(configServiceMock);

    expect(result1.secret).toBe('secret-1');
    expect(result2.secret).toBe('secret-2');
  });
});
