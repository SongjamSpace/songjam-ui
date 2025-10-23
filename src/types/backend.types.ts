interface PollV2 {
  id: string;
  options: {
    position: number;
    label: string;
    votes: number;
  }[];
  duration_minutes?: number;
  end_datetime?: string;
  voting_status?: string;
}
interface Photo {
  id: string;
  url: string;
  alt_text: string | undefined;
}
interface Video {
  id: string;
  preview: string;
  url?: string;
}
interface Mention {
  id: string;
  username?: string;
  name?: string;
}

interface Mention {
  id: string;
  username?: string;
  name?: string;
}
interface Photo {
  id: string;
  url: string;
  alt_text: string | undefined;
}
interface Video {
  id: string;
  preview: string;
  url?: string;
}
interface PlaceRaw {
  id?: string;
  place_type?: string;
  name?: string;
  full_name?: string;
  country_code?: string;
  country?: string;
  bounding_box?: {
    type?: string;
    coordinates?: number[][][];
  };
}

/**
 * A parsed Tweet object.
 */
export interface MongoTweet {
  bookmarkCount?: number;
  conversationId?: string;
  hashtags: string[];
  html?: string;
  id: string;
  //   inReplyToStatus?: MongoTweet;
  inReplyToStatusId?: string;
  isQuoted?: boolean;
  isPin?: boolean;
  isReply?: boolean;
  isRetweet?: boolean;
  isSelfThread?: boolean;
  language?: string;
  likes?: number;
  name?: string;
  mentions: Mention[];
  permanentUrl?: string;
  photos: Photo[];
  place?: PlaceRaw;
  //   quotedStatus?: MongoTweet;
  quotedStatusId?: string;
  quotes?: number;
  replies?: number;
  retweets?: number;
  //   retweetedStatus?: MongoTweet;
  retweetedStatusId?: string;
  text?: string;
  //   thread: MongoTweet[];
  timeParsed?: Date | null;
  timestamp?: number;
  urls: string[];
  userId?: string;
  username?: string;
  videos: Video[];
  views?: number;
  sensitiveContent?: boolean;
  poll?: PollV2 | null;
  isApiFetch?: boolean;
  createdAt?: string;
}

export interface Profile {
  avatar?: string;
  banner?: string;
  biography?: string;
  birthday?: string;
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
  mediaCount?: number;
  statusesCount?: number;
  isPrivate?: boolean;
  isVerified?: boolean;
  isBlueVerified?: boolean;
  joined?: Date;
  likesCount?: number;
  listedCount?: number;
  location: string;
  name?: string;
  pinnedTweetIds?: string[];
  tweetsCount?: number;
  url?: string;
  userId?: string;
  username?: string;
  website?: string;
  canDm?: boolean;
}
