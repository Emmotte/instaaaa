import type { Config, Results } from './types';
import { LogLevel } from './types';

export const DEFAULT_CONFIG: Config = {
  // Authentication & Targets
  username: '',
  password: '',
  targets: ['instagram'],

  // Data Fetching
  getFollowers: true,
  getFollowing: true,
  skipSession: false,
  skipFollowers: false,
  skipFollowings: false,
  skipGettingStoryDetails: false,
  skipGettingPostsDetails: false,
  getMorePostDetails: false,

  // Downloads
  downloadProfilePictures: true,
  downloadStories: true,
  downloadHighlights: false,
  downloadPosts: true,
  maxPostsToDownload: 20,
  downloadDir: 'downloads/',

  // Output & Logging
  newFollowersFile: 'output/{target}/new_followers.txt',
  newFollowingFile: 'output/{target}/new_following.txt',
  unfollowedByFile: 'output/{target}/unfollowed_by.txt',
  unfollowedYouFile: 'output/{target}/unfollowed_you.txt',
  notFollowingYouBackFile: 'output/{target}/not_following_you_back.txt',
  mutualFollowingFile: 'output/{target}/mutual_following.txt',
  databaseFile: 'database.db',
  logFile: 'instagram_monitor',
  logLevel: LogLevel.INFO,
  csvFile: '',
  dotenvFile: '',
  disableLogging: false,

  // Notifications
  statusNotification: false,
  followersNotification: false,
  errorNotification: true,

  // Intervals & Delays
  instaCheckInterval: 5400,
  randomSleepDiffLow: 900,
  randomSleepDiffHigh: 180,
  nextOperationDelay: 0.7,
  livenessCheckInterval: 43200,
  checkPostsInHoursRange: false,
  minH1: 0,
  maxH1: 4,
  minH2: 11,
  maxH2: 23,

  // Human Simulation
  beHuman: false,
  dailyHumanHits: 5,
  myHashtags: ['travel', 'food', 'nature'],
  beHumanVerbose: false,

  // Advanced Settings
  localTimezone: 'Auto',
  detectChangedProfilePic: true,
  profilePicFileEmpty: 'instagram_profile_pic_empty.jpeg',
  imgcatPath: 'imgcat',
  enableJitter: false,
  jitterVerbose: false,
  userAgent: '',
  userAgentMobile: '',
  checkInternetUrl: 'https://www.instagram.com/',
  checkInternetTimeout: 5,
};

export const MOCK_RESULTS: Results = {
  newFollowers: { target: 'instagram', users: ['user_a', 'user_b', 'user_c', 'user_d'] },
  newFollowing: { target: 'instagram', users: ['user_e', 'user_f'] },
  unfollowedBy: { target: 'instagram', users: ['user_g'] },
  unfollowedYou: { target: 'instagram', users: ['user_h', 'user_i'] },
  notFollowingYouBack: { target: 'instagram', users: ['user_j', 'user_k', 'user_l'] },
  mutualFollowing: { target: 'instagram', users: ['user_m', 'user_n', 'user_o', 'user_p', 'user_q', 'user_r', 'user_s', 'user_t'] },
  downloadedMediaCount: 15,
};

export const MOCK_LOG_STREAM: string[] = [
    "[INFO] Starting Instagram Monitor...",
    "[INFO] Logging in as user 'your_username'...",
    "[SUCCESS] Login successful.",
    "[INFO] Processing target: 'instagram'",
    "[INFO] Fetching followers for 'instagram'...",
    "[INFO] Fetched 500 followers.",
    "[INFO] Fetching following for 'instagram'...",
    "[INFO] Fetched 100 following.",
    "[WARNING] Rate limit approaching. Applying random delay.",
    "[INFO] Comparing follower lists...",
    "[INFO] Found 4 new followers.",
    "[INFO] Found 2 users who unfollowed you.",
    "[INFO] Downloading profile picture for 'instagram'...",
    "[SUCCESS] Profile picture downloaded.",
    "[INFO] Downloading stories for 'instagram'...",
    "[INFO] Found 3 new stories. Downloading...",
    "[ERROR] Failed to download story from user_x. Media may be expired.",
    "[SUCCESS] Stories downloaded.",
    "[INFO] Downloading posts for 'instagram'...",
    "[INFO] Found 12 new posts. Downloading...",
    "[SUCCESS] Posts downloaded.",
    "[INFO] Writing results to output files...",
    "[SUCCESS] Monitoring complete."
];