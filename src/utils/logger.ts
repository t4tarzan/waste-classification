// Production-safe logging utility
const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args);
    }
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...args);
    }
  }
};

export default logger;
