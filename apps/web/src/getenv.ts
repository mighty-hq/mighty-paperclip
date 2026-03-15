import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// added to exports
export const getEnv = () => {
  return createEnv({
    runtimeEnv: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },

    server: {
      OPENAI_API_KEY: z.string().optional(),
    },
  });
};

// added to exports
export const appEnv = getEnv();
