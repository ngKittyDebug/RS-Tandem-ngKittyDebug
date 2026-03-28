export const GitHubs = [
  {
    id: 1,
    name: 'AlexGorSer',
    realName: 'Алексей',
    gitHubLink: 'https://github.com/AlexGorSer',
    imageLink: 'assets/images/gitHubProfiles/Loshara.jpg',
    badges: ['backend', 'CI/CD', 'DevOps'],
    roleTranslationKey: 'about.roles.alex',
    descriptionTranslationKey: 'about.descriptions.alex',
    componentsTranslationKey: 'about.components.alex',
  },
  {
    id: 2,
    name: 'WhaleisaJoy',
    realName: 'Мария',
    gitHubLink: 'https://github.com/WhaleisaJoy',
    imageLink: 'assets/images/gitHubProfiles/Maria.jpg',
    badges: ['frontend', 'team-lead', 'UI/UX'],
    roleTranslationKey: 'about.roles.maria',
    descriptionTranslationKey: 'about.descriptions.maria',
    componentsTranslationKey: 'about.components.maria',
  },
  {
    id: 3,
    name: 'pavelkuvsh1noff',
    realName: 'Павел',
    gitHubLink: 'https://github.com/pavelkuvsh1noff',
    imageLink: 'assets/images/gitHubProfiles/Pavel.png',
    badges: ['frontend', 'i18n'],
    roleTranslationKey: 'about.roles.pavel',
    descriptionTranslationKey: 'about.descriptions.pavel',
    componentsTranslationKey: 'about.components.pavel',
  },
  {
    id: 4,
    name: 'Oksi2510',
    realName: 'Оксана',
    gitHubLink: 'https://github.com/Oksi2510',
    imageLink: 'assets/images/gitHubProfiles/Oksana.jpg',
    badges: ['frontend', 'design'],
    roleTranslationKey: 'about.roles.oksana',
    descriptionTranslationKey: 'about.descriptions.oksana',
    componentsTranslationKey: 'about.components.oksana',
  },
  {
    id: 5,
    name: 'Alena1409',
    realName: 'Алена',
    gitHubLink: 'https://github.com/Alena1409',
    imageLink: 'assets/images/gitHubProfiles/Alena.jpg',
    badges: ['frontend', 'AI'],
    roleTranslationKey: 'about.roles.alena',
    descriptionTranslationKey: 'about.descriptions.alena',
    componentsTranslationKey: 'about.components.alena',
  },
  {
    id: 6,
    name: 'kozochkina82',
    realName: 'Надежда',
    gitHubLink: 'https://github.com/kozochkina82',
    imageLink: 'assets/images/gitHubProfiles/Hope.png',
    badges: ['frontend', 'game-dev'],
    roleTranslationKey: 'about.roles.nadezhda',
    descriptionTranslationKey: 'about.descriptions.nadezhda',
    componentsTranslationKey: 'about.components.nadezhda',
  },
  {
    id: 7,
    name: 'JsPowWow',
    realName: 'Ментор',
    gitHubLink: 'https://github.com/JsPowWow',
    imageLink: 'assets/images/gitHubProfiles/Legend.png',
    badges: ['mentor', 'legend'],
    roleTranslationKey: 'about.roles.mentor',
    descriptionTranslationKey: 'about.descriptions.mentor',
    componentsTranslationKey: 'about.components.mentor',
  },
] satisfies GitHubData[];

export const AiAssistants = [
  {
    id: 1,
    name: 'ChatGPT',
    usedBy: 'Alena1409',
    usedByTranslationKey: 'about.aiUsers.alena',
    roleTranslationKey: 'about.aiRoles.chatgpt',
    descriptionTranslationKey: 'about.aiDescriptions.chatgpt',
    imageLink: 'assets/images/gitHubProfiles/ai/chatGPT.png',
    badges: ['AI', 'design', 'content'],
  },
  {
    id: 2,
    name: 'Claude',
    usedBy: 'Alena1409',
    usedByTranslationKey: 'about.aiUsers.alena',
    roleTranslationKey: 'about.aiRoles.claude',
    descriptionTranslationKey: 'about.aiDescriptions.claude',
    imageLink: 'assets/images/gitHubProfiles/ai/Kolyn.png',
    badges: ['AI', 'content', 'refactoring'],
  },
  {
    id: 3,
    name: 'Groq',
    usedBy: 'Alena1409',
    usedByTranslationKey: 'about.aiUsers.alena',
    roleTranslationKey: 'about.aiRoles.groq',
    descriptionTranslationKey: 'about.aiDescriptions.groq',
    imageLink: 'assets/images/gitHubProfiles/ai/Grock.png',
    badges: ['AI', 'API', 'integration'],
  },
  {
    id: 4,
    name: 'Qwen',
    usedBy: 'AlexGorSer',
    usedByTranslationKey: 'about.aiUsers.alex',
    roleTranslationKey: 'about.aiRoles.qwen',
    descriptionTranslationKey: 'about.aiDescriptions.qwen',
    imageLink: 'assets/images/gitHubProfiles/ai/qwen.jpg',
    badges: ['AI', 'smart-thoughts'],
  },
  {
    id: 5,
    name: 'Claude (Коляныч)',
    usedBy: 'JsPowWow',
    usedByTranslationKey: 'about.aiUsers.jspowwow',
    roleTranslationKey: 'about.aiRoles.codeQualityBot',
    descriptionTranslationKey: 'about.aiDescriptions.codeQualityBot',
    imageLink: 'assets/images/gitHubProfiles/ai/Kolyn.png',
    badges: ['AI', 'code-review', 'bot'],
  },
] satisfies AiData[];

export interface GitHubData {
  id: number;
  name: string;
  realName: string;
  gitHubLink: string;
  imageLink: string;
  badges: string[] | string;
  roleTranslationKey: string;
  descriptionTranslationKey: string;
  componentsTranslationKey: string;
}

export interface AiData {
  id: number;
  name: string;
  usedBy: string;
  usedByTranslationKey: string;
  roleTranslationKey: string;
  descriptionTranslationKey: string;
  imageLink: string;
  badges: string[] | string;
}
