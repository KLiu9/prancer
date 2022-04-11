import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JSON"];

const DragDrop = ({onRefresh}) => {
    const [file, setFile] = useState('');

    const handleChange = (file) => {
        onRefresh(file);
    };

    return (
        <div>
            <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
        </div>
    );
}

export default DragDrop;