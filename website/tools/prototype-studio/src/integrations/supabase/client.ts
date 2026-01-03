// Stubbed Supabase client for standalone website (no Supabase backend)
// The prototype studio uses Microsoft Clarity for analytics instead

const createQueryBuilder = () => ({
  insert: () => Promise.resolve({ data: null, error: null }),
  select: () => Promise.resolve({ data: [], error: null }),
  update: () => Promise.resolve({ data: null, error: null }),
  delete: () => Promise.resolve({ data: null, error: null }),
});

export const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
  from: () => createQueryBuilder(),
  functions: {
    invoke: () => Promise.resolve({ data: null, error: null }),
  },
};
