import { StylesConfig } from "react-select";

type SelectOption = {
  value: string;
  label: string;
};

const selectStyles: StylesConfig<SelectOption, true> = {
  container: (provided) => ({
    ...provided,
    width: "100%",
  }),
  control: (provided, state) => ({
    ...provided,
    padding: "2px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--input)",
    borderRadius: "calc(var(--radius) - 2px)",
    boxShadow: state.isFocused ? "0 0 0 2px #fff" : "none",
    "&:hover": {
      cursor: "text",
    },
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    color: "var(--foreground)",
  }),
  multiValue: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "var(--accent)",
  }),
  multiValueLabel: (baseStyles) => ({
    ...baseStyles,
    color: "var(--foreground)",
  }),
  multiValueRemove: (baseStyles) => ({
    ...baseStyles,
    color: "var(--foreground)",
    "&:hover": {
      color: "var(--destructive)",
      backgroundColor: "var(--accent)",
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "var(--foreground)",
    "&:hover": {
      color: "var(--destructive)",
      cursor: "pointer",
    },
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: "none",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    display: "none",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#202020",
    display: "none",
  }),
};

export default selectStyles;
