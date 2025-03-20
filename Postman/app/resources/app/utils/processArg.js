module.exports = {
  /**
   * @description It returns the value of the command line argument passed.
   * @returns {String | Boolean}
   */
  getValue: (argName) => {
    for (const arg of process.argv.slice(1)) {
      if (arg === `--${argName}`) {
        return true;
      } else if (arg.startsWith(`--${argName}=`)) {
        let argArr = arg.split('=');
        let value = '';
        if (argArr[1] !== '') {
          value = argArr.slice(1).join('=');
        }
        return value;
      }
    }
    return '';
  }
};
