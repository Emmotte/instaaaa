export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface Config {
  // Authentication & Targets
  username: string;
  password: string;
  targets: string[];

  // Data Fetching
  getFollowers: boolean;
  getFollowing: boolean;
  skipSession: boolean;
  skipFollowers: boolean;
  skipFollowings: boolean;
  skipGettingStoryDetails: boolean;
  skipGettingPostsDetails: boolean;
  getMorePostDetails: boolean;

  // Downloads
  downloadProfilePictures: boolean;
  downloadStories: boolean;
  downloadHighlights: boolean;
  downloadPosts: boolean;
  maxPostsToDownload: number;
  downloadDir: string;
  
  // Output & Logging
  newFollowersFile: string;
  newFollowingFile: string;
  unfollowedByFile: string;
  unfollowedYouFile: string;
  notFollowingYouBackFile: string;
  mutualFollowingFile: string;
  databaseFile: string;
  logFile: string;
  logLevel: LogLevel;
  csvFile: string;
  dotenvFile: string;
  disableLogging: boolean;
  
  // Notifications
  statusNotification: boolean;
  followersNotification: boolean;
  errorNotification: boolean;

  // Intervals & Delays
  instaCheckInterval: number;
  randomSleepDiffLow: number;
  randomSleepDiffHigh: number;
  nextOperationDelay: number;
  livenessCheckInterval: number;
  checkPostsInHoursRange: boolean;
  minH1: number;
  maxH1: number;
  minH2: number;
  maxH2: number;

  // Human Simulation
  beHuman: boolean;
  dailyHumanHits: number;
  myHashtags: string[];
  beHumanVerbose: boolean;

  // Advanced Settings
  localTimezone: string;
  detectChangedProfilePic: boolean;
  profilePicFileEmpty: string;
  imgcatPath: string;
  enableJitter: boolean;
  jitterVerbose: boolean;
  userAgent: string;
  userAgentMobile: string;
  checkInternetUrl: string;
  checkInternetTimeout: number;
}

export interface Results {
  newFollowers: { target: string; users: string[] };
  newFollowing: { target: string; users: string[] };
  unfollowedBy: { target: string; users: string[] };
  unfollowedYou: { target:string; users: string[] };
  notFollowingYouBack: { target:string; users: string[] };
  mutualFollowing: { target:string; users: string[] };
  downloadedMediaCount: number;
}