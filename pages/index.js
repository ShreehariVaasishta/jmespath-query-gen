import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import JMESPath from "jmespath";


function getKeyList(obj, parentKey = null) {
  let keyList = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const nestedKey = `${currentKey}[${i}]`;
        keyList.push(nestedKey);
        if (typeof value[i] === "object" && value[i] !== null) {
          keyList = keyList.concat(getKeyList(value[i], nestedKey));
        }
      }
    } else if (typeof value === "object" && value !== null) {
      keyList.push(currentKey);
      keyList = keyList.concat(getKeyList(value, currentKey));
    } else {
      keyList.push(currentKey);
    }
  }

  return keyList;
}


function buildQueryString(current, selected) {
  let queryString = "";

  if (selected) {
    if (Array.isArray(selected)) {
      queryString = queryString + "[*]." + selected.join(".");
    } else {
      queryString = queryString + selected;
    }
  } else {
    queryString = "";
  }

  if (typeof current === "object" && current !== null) {
    Object.keys(current).forEach((key) => {
      const nested = buildQueryString(current[key], null);
      if (nested !== "") {
        queryString = queryString + (queryString === "" ? "" : ".") + key + nested;
      }
    });
  }

  return queryString;
}

export default function QueryBuilder() {
  const [jsonInput, setJsonInput] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);
  const [queryString, setQueryString] = useState("");

  const handleJsonInputChange = (event) => {
    setJsonInput(event.target.value);
    setSelectedKey(null);
    setQueryString("");
  };

  const handleKeySelect = (event, value) => {
    setSelectedKey(value);
    const qs = buildQueryString(JSON.parse(jsonInput), value)
    setQueryString(qs + ": " + JSON.stringify(JMESPath.search(JSON.parse(jsonInput), qs)));
    console.log(qs, "<kaksjk")
    console.log(jsonInput, "<json")
    console.log(JMESPath.search(JSON.parse(jsonInput), qs), "<asjkajd")
  };

  const handleClearButtonClick = () => {
    setJsonInput("");
    setSelectedKey(null);
    setQueryString("");
  };

  const keyList = !!jsonInput && getKeyList(JSON.parse(jsonInput));

  return (
    <Box style={{ display: "flex", flexDirection: "column" }}>
      <TextField
        label="JSON Input"
        multiline
        rows={4}
        variant="outlined"
        value={jsonInput}
        onChange={handleJsonInputChange}
        fullWidth
        style={{ marginBottom: "16px" }}
      />
      <Autocomplete
        disabled={!jsonInput}
        options={keyList}
        value={selectedKey}
        onChange={handleKeySelect}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" />
        )}
        style={{ marginBottom: "16px" }}

        fullWidth
      />
      <TextField
        label="Generated Query String"
        multiline
        rows={4}
        variant="outlined"
        value={queryString}
        fullWidth
        style={{ marginBottom: "16px" }}
        InputProps={{
          readOnly: true,
        }}
      />
      <Button variant="contained" onClick={handleClearButtonClick}>
        Clear
      </Button>
    </Box>
  );
}
