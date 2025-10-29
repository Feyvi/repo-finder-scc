export const selectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: 44,
    height: 44,
    borderRadius: 8,
    borderColor: state.isFocused ? "#2563EB" : "#D1D5DB",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(37,99,235,0.12)" : provided.boxShadow,
    paddingLeft: 4,
    paddingRight: 4,
    background: "white",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    height: 44,
    padding: "0 6px",
    color: "#000",
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    height: 44,
  }),
  input: (provided: any) => ({
    ...provided,
    margin: 0,
    padding: 0,
    color: "#000",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#000",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "#000",
    maxWidth: "100%",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#000",
    opacity: 0.6,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    color: "#000",
    backgroundColor: state.isFocused ? "#F3F4F6" : "#fff",
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 50,
    color: "#000",
  }),
  multiValue: (provided: any) => ({
    ...provided,
    maxHeight: 34,
    overflow: "hidden",
    background: "#E5E7EB",
  }),
};