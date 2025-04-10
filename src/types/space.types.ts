export type TwitterUser = {
  userId: string;
  displayName: string;
  twitterScreenName: string;
  avatarUrl: string;
  isVerified: boolean;
  admin?: boolean;
  speaker?: boolean;
  listener?: boolean;
};
export type SpaceListener = TwitterUser & {
  joinedAt: number;
  leftAt: number | null;
  timeSpent: number | null;
};

export type Segment = {
  start: number;
  text: string;
  end: number;
  seek: number;
  no_speech_prob: number;
};
export type Space = {
  transcriptionStatus:
    | 'NOT_STARTED'
    | 'STARTED'
    | 'PROCESSING'
    | 'FAILED'
    | 'SHORT_ENDED'
    | 'ENDED';
  isLive?: boolean;
  isRecorded?: boolean;
  isScheduled?: boolean;
  spaceId: string;
  userHelperMessage?: string;
  // Space details
  hlsUrl: string;
  title: string;
  state: string;
  mediaKey: string;
  createdAt: number;
  startedAt: number;
  endedAt: number;
  contentType: string;
  isSpaceAvailableForReplay: boolean;
  isSpaceAvailableForClipping: boolean;
  totalReplayWatched: number;
  totalLiveListeners: number;
  tweetId: string | any;
  admins: TwitterUser[];
  speakers: TwitterUser[];
  isLiveListenersSyncing?: boolean;
  liveListenersCount?: number;

  scheduledStart?: number;
  docCreatedAt?: number;
  transcriptionProgress?: TranscriptionProgress;
};

export enum TranscriptionProgress {
  NOT_STARTED = 0,
  DOWNLOADING_AUDIO = 1,
  TRANSCRIBING_STARTED = 2,
  TRANSCRIBING = 3,
  SUMMARIZING = 4,
  AI_SUMMARY = 5,
  ENDED = 6,
}

export type AudioSpace = {
  metadata: {
    title: string;
    rest_id: string;
    state: string;
    media_key: string;
    created_at: number;
    started_at: number;
    ended_at: string;
    updated_at: number;
    content_type: string;
    creator_results: {
      result: any;
    };
    conversation_controls: number;
    disallow_join: boolean;
    is_employee_only: boolean;
    is_locked: boolean;
    is_muted: boolean;
    is_space_available_for_clipping: boolean;
    is_space_available_for_replay: boolean;
    narrow_cast_space_type: number;
    no_incognito: boolean;
    total_replay_watched: number;
    total_live_listeners: number;
    tweet_results: Record<string, any>;
    max_guest_sessions: number;
    max_admin_capacity: number;
  };
  participants: {
    total: number;
    admins: any[];
    speakers: any[];
    listeners: any[];
  };
};
