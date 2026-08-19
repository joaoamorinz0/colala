export type ProfileSocialLink = {
  id: string;
  user_id: string;
  url: string;
  created_at: string;
};

export type SocialPlatform = {
  name: string;
  hostname: string;
};

export type DetectedPlatform = SocialPlatform & {
  displayName: string;
  icon: string;
};
