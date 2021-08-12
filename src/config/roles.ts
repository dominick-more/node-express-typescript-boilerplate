export type RoleNames = 'admin' | 'user';

const allRoles: { [key: string]: readonly string[] } = Object.freeze({
  user: Object.freeze([]),
  admin: Object.freeze(['getUsers', 'manageUsers']),
});

export const roles = Object.freeze(Object.keys(allRoles));
export const roleRights = new Map(Object.entries(allRoles));
