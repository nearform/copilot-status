// Lives outside hooks/ so services and widgets can read query keys without
// importing the hooks module (and, through it, the auth store).
export const QUERY_KEYS = {
  USER: ['user'],
  QUOTA: ['quota'],
  // Kept apart from QUOTA so sample data never reaches the home screen widget,
  // which reads QUOTA by exact key.
  SAMPLE_QUOTA: ['quota', 'sample'],
} as const;
