export type GetUsersResponse = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  appAccess: Apps;
}

export type Apps = {
  catalog: boolean;
  geo: boolean;
  form: boolean;
}