export interface User {
  id: string;
  name: string;
  dweaPoints: number;
  recommendedItems: string[];
  linkedAccounts: {
    amazon: boolean;
    carrefour: boolean;
  };
}
