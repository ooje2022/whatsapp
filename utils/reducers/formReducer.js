export const reducer = (state, action) => {
  //const validationResult = action.validationResult;
  const { validationResult, inputId, inputValue } = action;
  //state.formIsValid = validationResult === undefined

  const updatedValues = {
    ...state.inputValues,
    [inputId]: inputValue,
  };

  const updatedValidities = {
    ...state.inputValidities,
    [inputId]: validationResult,
  };

  let updatedFormIsValid = true;
  for (const key in updatedValidities) {
    if (updatedValidities[key] !== undefined) {
      updatedFormIsValid = false;
      break;
    }
  }

  return {
    inputValues: updatedValues,
    inputValidities: updatedValidities, //...state,
    formIsValid: updatedFormIsValid,
  };
};
