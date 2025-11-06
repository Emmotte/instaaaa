import type { Config } from './types';
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