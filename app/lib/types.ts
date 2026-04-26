export type ApiListResponse<T> =
  | T[]
  | {
      items: T[];
    }
  | {
      data: T[];
    };

export type Master = {
  id: string;
  name: string;
  createdAt?: string;
  sex: string;
};

export type Chubby = {
  id: string;
  name: string;
  sex: string;
  createdAt?: string;
};

export type Feed = {
  id: string;
  chubbyId: string;
  name: string;
  date: string;
};

export type CreateMasterInput = {
  name: string;
  sex: string;
  birthDay: string;
};

export type CreateChubbyInput = {
  name: string;
  sex: string;
  birthDay: string;
};

export type CreateFeedInput = {
  chubbyId: string;
  name: string;
  date: string;
};