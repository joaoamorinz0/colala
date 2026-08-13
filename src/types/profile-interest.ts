export type ProfileInterest = {
  user_id: string;
  category_id: string;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
};
