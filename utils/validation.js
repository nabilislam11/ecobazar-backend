const emptyFieldValidation = (res, ...fields) => {
  if (fields.includes("") || fields.includes(undefined)) {
    return res.status(400).json({ message: "Please fill all the field" });
  }
};
module.exports = emptyFieldValidation;
