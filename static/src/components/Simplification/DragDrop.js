import React, { useState } from "react";
// import axios from 'axios';
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JSON"];

const DragDrop = () => {
    const [file, setFile] = useState('');
    const [uploadPercentage, setUploadPercentage] = useState(0);

    const [text, setText] = useState();

    let fileReader;

    const handleFileRead = (file) => {
        let content = fileReader.result;
        var out = "";
        let obj = JSON.parse(content);
        for (let i = 0; i < obj.length; i++) {
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
                {text && <pre>{text}</pre>}
            </div>
        </div>
    );
}

export default DragDrop;