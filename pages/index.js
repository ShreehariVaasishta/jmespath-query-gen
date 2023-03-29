import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import JMESPath from "jmespath";
import JSONInput from "react-json-editor-ajrm/index";
import locale from "react-json-editor-ajrm/locale/en";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";


function getKeyList(obj, parentKey = null) {
    let keyList = [];

    for (const [key, value] of Object.entries(obj)) {
        const currentKey = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(value)) {
            keyList.push(currentKey); // add the key that contains the array
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
        setJsonInput(event.jsObject);
        setSelectedKey(null);
        setQueryString("");
    };

    const handleKeySelect = (event, value) => {
        setSelectedKey(value);
        const qs = buildQueryString(jsonInput, value);
        setQueryString({
            query: qs,
            value: JMESPath.search(jsonInput, qs),
        });
    };

    // const handleClearButtonClick = () => {
    //     setJsonInput("");
    //     setSelectedKey(null);
    //     setQueryString("");
    // };

    const keyList = !!jsonInput && getKeyList(jsonInput);

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <Grid rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6} >
                        <Typography variant="h4" gutterBottom component="div">
                            JMESPath Query Generator
                        </Typography>
                    </Grid>
                    <Grid item xs={6}   >
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel>Input</FormLabel>
                            <JSONInput
                                locale={locale}
                                placeholder={{
                                    "locations": [
                                        { "name": "Seattle", "state": "WA" },
                                        { "name": "New York", "state": "NY" },
                                        { "name": "Bellevue", "state": "WA" },
                                        { "name": "Olympia", "state": "WA" }
                                    ]
                                }}
                                onChange={handleJsonInputChange}
                                height="550px"
                                width="100%"
                                theme="dark"
                                style={{
                                    body: {
                                        fontSize: '16px',
                                    },
                                    marginBottom: "16px"
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} >
                        <Autocomplete
                            disabled={!jsonInput}
                            options={keyList}
                            value={selectedKey}
                            onChange={handleKeySelect}
                            renderInput={(params) => (
                                <TextField {...params} variant="outlined" label="Query Selector" />
                            )}
                            style={{ marginBottom: "16px", marginTop: "16px", width: "50%" }}
                        />
                    </Grid>
                    <Grid item xs={6}  >


                        <FormControl fullWidth>
                            <FormLabel>Output</FormLabel>
                            <JSONInput
                                locale={locale}
                                placeholder={
                                    !!queryString
                                        ? queryString
                                        : { key: null, value: null }
                                }
                                onChange={handleJsonInputChange}
                                height="550px"
                                width="100%"
                                theme="dark_vscode_tribute"
                                style={{
                                    body: {
                                        fontSize: "16px",
                                    },
                                }}
                                viewOnly={true}
                            />
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
