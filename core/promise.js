function promise(mainFunc) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await mainFunc(resolve, reject);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  module.exports = {
    promise,
  
  };