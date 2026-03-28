export const GitHubs = [
  {
    id: 1,
    name: 'AlexGorSer',
    gitHubLink: 'https://github.com/AlexGorSer',
    imageLink: 'assets/images/gitHubProfiles/Loshara.jpg',
    badges: ['backend', 'CI/CD', 'DevOps'],
    roleTranslationKey: 'about.roles.alex',
    componentsTranslationKey: 'about.components.alex',
  },
  {
    id: 2,
    name: 'WhaleisaJoy',
    gitHubLink: 'https://github.com/WhaleisaJoy',
    imageLink: 'assets/images/gitHubProfiles/Maria.jpg',
    badges: ['frontend', 'team-lead', 'UI/UX'],
    roleTranslationKey: 'about.roles.maria',
    componentsTranslationKey: 'about.components.maria',
    gameTranslationKey: 'about.games.maria',
  },
  {
    id: 3,
    name: 'pavelkuvsh1noff',
    gitHubLink: 'https://github.com/pavelkuvsh1noff',
    imageLink: 'assets/images/gitHubProfiles/Pavel.png',
    badges: ['frontend', 'i18n'],
    roleTranslationKey: 'about.roles.pavel',
    componentsTranslationKey: 'about.components.pavel',
    gameTranslationKey: 'about.games.pavel',
  },
  {
    id: 4,
    name: 'Oksi2510',
    gitHubLink: 'https://github.com/Oksi2510',
    imageLink: 'assets/images/gitHubProfiles/Oksana.jpg',
    badges: ['frontend', 'design'],
    roleTranslationKey: 'about.roles.oksana',
    componentsTranslationKey: 'about.components.oksana',
    gameTranslationKey: 'about.games.oksana',
  },
  {
    id: 5,
    name: 'Alena1409',
    gitHubLink: 'https://github.com/Alena1409',
    imageLink: 'assets/images/gitHubProfiles/Alena.jpg',
    badges: ['frontend', 'AI'],
    roleTranslationKey: 'about.roles.alena',
    componentsTranslationKey: 'about.components.alena',
    gameTranslationKey: 'about.games.alena',
  },
  {
    id: 6,
    name: 'kozochkina82',
    gitHubLink: 'https://github.com/kozochkina82',
    imageLink: 'assets/images/gitHubProfiles/Hope.png',
    badges: ['frontend', 'game-dev'],
    roleTranslationKey: 'about.roles.nadezhda',
    componentsTranslationKey: 'about.components.nadezhda',
    gameTranslationKey: 'about.games.nadezhda',
  },
  {
    id: 7,
    name: 'JsPowWow',
    gitHubLink: 'https://github.com/JsPowWow',
    imageLink: 'assets/images/gitHubProfiles/Legend.png',
    badges: ['mentor', 'legend'],
    roleTranslationKey: 'about.roles.mentor',
    componentsTranslationKey: 'about.components.mentor',
  },
] satisfies GitHubData[];

export const AiAssistants = [
  {
    id: 1,
    name: 'ChatGPT',
    imageLink: 'assets/images/gitHubProfiles/ai/chatGPT.png',
    badges: ['AI', 'design', 'content'],
    descriptionTranslationKey: 'about.aiDescriptions.chatgpt',
  },
  {
    id: 2,
    name: 'Claude',
    imageLink: 'assets/images/gitHubProfiles/ai/Kolyn.png',
    badges: ['AI', 'content', 'refactoring'],
    descriptionTranslationKey: 'about.aiDescriptions.claude',
  },
  {
    id: 3,
    name: 'Groq',
    imageLink: 'assets/images/gitHubProfiles/ai/Grock.png',
    badges: ['AI', 'API', 'integration'],
    descriptionTranslationKey: 'about.aiDescriptions.groq',
  },
  {
    id: 4,
    name: 'Qwen',
    imageLink: 'assets/images/gitHubProfiles/ai/qwen.jpg',
    badges: ['AI', 'smart-thoughts'],
    descriptionTranslationKey: 'about.aiDescriptions.qwen',
  },
  {
    id: 5,
    name: 'Claudя, ручной миньон',
    imageLink: 'assets/images/gitHubProfiles/ai/Kolyn.png',
    badges: ['AI', 'code-review', 'bot'],
    descriptionTranslationKey: 'about.aiDescriptions.codeQualityBot',
  },
] satisfies AiData[];

export interface GitHubData {
  id: number;
  name: string;
  gitHubLink: string;
  imageLink: string;
  badges: string[] | string;
  roleTranslationKey: string;
  componentsTranslationKey: string;
  gameTranslationKey?: string;
}

export interface AiData {
  id: number;
  name: string;
  imageLink: string;
  badges: string[] | string;
  descriptionTranslationKey: string;
}
