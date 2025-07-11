export interface ISocial {
  platform: string;
  url: string;
}

export interface ICard {
  id: string;
  user_id: string;
  gender: string;
  dob: string;
  nationality: string;
  phone: string;
  address: string;
  card_type: string;
  social: ISocial[];
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user: string;
}

export interface ICardResponse {
  data: ICard[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  cards: string;
}
