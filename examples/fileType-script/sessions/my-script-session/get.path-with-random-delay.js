module.exports = {
  execute: () => {
    const randomDelay = Math.floor(Math.random() * 1000);
    return {
      status: 200,
      delay: randomDelay,
      body: {
        data: `response with ${randomDelay}ms delay`,
      },
    };
  },
};
