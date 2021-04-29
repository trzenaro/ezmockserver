module.exports = {
  execute: (ctx) => {
    const randomDelay = Math.floor(Math.random() * 200);

    return {
      status: 200,
      delay: randomDelay,
      body: {
        requestedUrl: ctx.originalUrl,
        delayedWith: `${randomDelay}ms`,
      },
    };
  },
};
