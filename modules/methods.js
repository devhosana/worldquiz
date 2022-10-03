const randomNumFrom = function(array) {
  const maximum = array.length;
  const num = Math.trunc((Math.random() * maximum) + 1);
  return num - 1;
};

export default randomNumFrom;