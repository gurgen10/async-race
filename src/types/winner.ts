export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export interface WinnerCreate {
  id: number;
  wins: number;
  time: number;
}

export interface WinnerWithCar extends Winner {
  name: string;
  color: string;
}
