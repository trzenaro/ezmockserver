const buildResolver = (resolve) => {
  let totalResolved = 0;
  let totalPending = 0;
  return {
    addOne: () => {
      totalPending++;
    },
    resolveOne: () => {
      totalResolved++;
      if (totalResolved == totalPending) {
        resolve();
      }
    },
  };
};

module.exports = buildResolver;
