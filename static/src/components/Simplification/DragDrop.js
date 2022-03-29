import React, { useState } from "react";
import axios from 'axios';
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JSON"];

const DragDrop = ({onRefresh}) => {
    const [file, setFile] = useState('');
    const [uploadPercentage, setUploadPercentage] = useState(0);

    const handleChange = (file) => {
        console.log('handleChange: %s', file);
        setFile(file);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            
                onUploadProgress: progressEvent => {
                    setUploadPercentage(
                        parseInt(
                            Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        )
                    );
                }
            });
        } catch (err) {
            if (err.response.status === 500) {
              console.log('There was a problem with the server');
            } else {
              console.log(err.response.data.msg);
            }
            setUploadPercentage(0)
        }
        onRefresh();
    };

    return (
        <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
    );
}

export default DragDrop;