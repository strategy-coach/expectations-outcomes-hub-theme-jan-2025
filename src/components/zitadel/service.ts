

const roleCache = new Map<string, { role: string; timestamp: number }>();

export const clearUserRoleCache = (userId: string): void => {
  roleCache.delete(userId);
  console.log(`Cache cleared for user: ${userId}`);
};

