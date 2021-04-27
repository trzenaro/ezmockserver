let counter = 0;

module.exports = {
  execute: (ctx) => {
    counter++;
    return {
      status: 200,
      body: {
        id: counter,
        name: `USER ${counter}`,
      },
    };
  },
};
