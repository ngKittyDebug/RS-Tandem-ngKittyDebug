export const GitHubs = [
  {
    id: 1,
    name: 'AlexGorSer',
    gitHubLink: 'https://github.com/AlexGorSer',
    imageLink: 'assets/images/gitHubProfiles/Loshara.jpg',
    badges: ['backend', 'CI/CD'],
  },
  {
    id: 2,
    name: 'WhaleisaJoy',
    gitHubLink: 'https://github.com/WhaleisaJoy',
    imageLink: 'assets/images/gitHubProfiles/Maria.jpg',
    badges: ['frontend', 'team-lead'],
  },
  {
    id: 3,
    name: 'pavelkuvsh1noff',
    gitHubLink: 'https://github.com/pavelkuvsh1noff',
    imageLink: 'assets/images/gitHubProfiles/Pavel.png',
    badges: ['frontend'],
  },
  {
    id: 4,
    name: 'Oksi2510',
    gitHubLink: 'https://github.com/Oksi2510',
    imageLink: 'assets/images/gitHubProfiles/Oksana.jpg',
    badges: ['frontend'],
  },
  {
    id: 5,
    name: 'Alena1409',
    gitHubLink: 'https://github.com/Alena1409',
    imageLink: 'assets/images/gitHubProfiles/Alena.jpg',
    badges: ['frontend'],
  },
  {
    id: 6,
    name: 'kozochkina82',
    gitHubLink: 'https://github.com/kozochkina82',
    imageLink: 'assets/images/gitHubProfiles/Hope.png',
    badges: ['frontend'],
  },
  {
    id: 7,
    name: 'JsPowWow',
    gitHubLink: 'https://github.com/JsPowWow',
    imageLink: 'assets/images/gitHubProfiles/Legend.png',
    badges: ['legend', 'claude'],
  },
] satisfies GitHubData[];

export interface GitHubData {
  id: number;
  name: string;
  gitHubLink: string;
  imageLink: string;
  badges: string[] | string;
}
