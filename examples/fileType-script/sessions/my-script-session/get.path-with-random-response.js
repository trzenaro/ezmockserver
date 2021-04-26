module.exports = {
  execute: () => {
    const statusList = [200, 400, 404, 500];
    const randomStatus = statusList[Math.floor(Math.random() * statusList.length)];
    return {
      status: randomStatus,
      delay: 0,
      body: {
        data: `response with ${randomStatus} status code`,
      },
    };
  },
};
