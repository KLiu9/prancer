import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JSON"];

const DragDrop = () => {
    const [file, setFile] = useState('');
    const [originalText, setOriginalText] = useState();
    const [text, setText] = useState();

    let fileReader;

    const handleFileRead = (file) => {
        let content = fileReader.result;
        var out = "";
        let obj = JSON.parse(content);
        let i;
        if ("original" in obj[0]) {
            setOriginalText(obj[0]["original"]);
            i = 1;
        } else {
            setOriginalText();
            i = 0;
        }
        for ( ; i < obj.length; i++) {
            out += obj[i]["text"] + "\n";
        }
        setText(out);
    };

    const handleChange = (file) => {
        setFile(file);
        fileReader = new FileReader();
        const blob = new Blob([file], { type: "application/json" });
        fileReader.onloadend = handleFileRead;
        fileReader.readAsText(blob);
    };

    return (
        <div>
            <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
            <div>
                Annotated Text: <br/>
                {text && <pre>{text}</pre>}
                Original Text: <br/>
                {originalText && <pre>{originalText}</pre>}
            </div>
        </div>
    );
}

export default DragDrop;