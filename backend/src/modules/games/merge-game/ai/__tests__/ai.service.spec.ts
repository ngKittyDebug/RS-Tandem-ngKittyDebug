import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai.service';
import { ConfigService } from '@nestjs/config';
global.fetch = jest.fn();

describe('AiService', () => {
  let service: AiService;

  const mockApiKey = 'test-api-key';
  const mockApiUrl = 'https://api.groq.com/v1/chat/completions';
  const mockApiModel = 'test-model';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                AI_KEY: mockApiKey,
                AI_URL: mockApiUrl,
                AI_MODEL: mockApiModel,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
