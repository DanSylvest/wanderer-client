export const stringValidator = ({
  val,
  minLength = 4,
  regExp = /[^A-Za-zА-Яа-я0-9_\-,.: ]/m,
}) => {
  if (minLength === 0 && val === '') {
    return true;
  }

  if (!val) {
    return false;
  }

  if (val.length < minLength) {
    return false;
  }

  return !val.match(regExp);
};

export const validateName = (val) => {
  return stringValidator({ val, minLength: 4 });
};

export const validateDescription = (val) => {
  return stringValidator({ val, minLength: 0 });
};