import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import Button from '@material-ui/core/Button';

import DragDrop from './DragDrop';
import { save_annotations } from '../../utils/http_functions';

const SimplificationView = () => {
  
  let fileReader;
  const gridRef = useRef();
  const gridStyle = useMemo(() => ({ height: '400px', width: '100%' }), []);
  const [objArray, setObjArray] = useState([]);
  const [rowData, setRowData] = useState([{},{},{},{},{},{},{}]);
  const [filename, setFilename] = useState('');
  const [gridData, setGridData] = useState([{}]);
  const [originalNotes, setOriginalNotes] = useState('');
  const [columnDefs] = useState([
    { headerName: "Original", field: "oldtext", cellStyle: {'wordBreak': 'normal'}},
    { headerName: "Simplified", field: "text", editable: true,  cellStyle: {'wordBreak': 'normal'}}
  ]);

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
      wrapText: true,
      autoHeight: true,
    };
  }, []);

  const popupParent = useMemo(() => {
    return document.body;
  }, []);

  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
    params.api.resetRowHeights();
  }, []);


  const handleFileRead = (file) => {
    let content = fileReader.result;
    let objArray = JSON.parse(content);
    if ("original" in objArray[0]) {
      setOriginalNotes(objArray[0]["original"]);
      objArray.shift();
    } else {
      setOriginalNotes('');
    }
    objArray.forEach(obj => 
      {
        if (obj.oldtext === undefined) 
          obj.oldtext = obj.text;
      });
    let newArray = [];
    let texts = {};
    // removes duplicates (same text with multiple labels)
    objArray.forEach(obj =>
      {
        if (!(obj.oldtext in texts)) {
          newArray.push(obj);
          texts[obj.oldtext] = obj.text;
        }
      });
    setObjArray(objArray);
    setGridData(newArray);
    setRowData(newArray);
  }

  const handleFileChange = useCallback((file) => {
    setFilename(file.name);
    fileReader = new FileReader();
    const blob = new Blob([file], { type: "application/json" });
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(blob); 
  },[]);

  const handleSaveAnnotations = () => {
    const {api, columnApi} = gridRef.current;
    // apis will be null before grid is initialized
    if (api == null || columnApi == null) { return; }
    let rowData = [];
    api.forEachNode(node => rowData.push(node.data));
    let map = {};
    rowData.forEach(row => { map[row.oldtext] = row.text });
    objArray.forEach(obj => { obj.text = map[obj.oldtext] }); // adds back duplicate texts
    const myannotations = objArray.slice();
    myannotations.unshift({ "original" : originalNotes }); // adds original text to json output
    save_annotations(filename.substring(0, filename.length - 5), myannotations, null);
  }

  return (
    <div>
      <b>Upload a json file: </b>
      <DragDrop onRefresh={handleFileChange}/>
      <div style={{"marginTop": "20px"}}>
      <b>Simplify text: {filename}</b>
      </div>
      <div id="myGrid" style={gridStyle} className="ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout={'normal'}
          animateRows={true}
          popupParent={popupParent}
          onGridReady={onGridReady}
        ></AgGridReact>
      </div>
      <div style={{"marginTop": "20px"}}>
        <Button
              className='hover-state'
              variant={'contained'}
              onClick={handleSaveAnnotations}
              color="primary"
            >
            Save Annotations
        </Button>
      </div>
      <div style={{"marginTop": "20px"}}>
        <b>Original Text:</b> 
      </div>
      <div
        style={{
          border: '10px solid #eee',
          padding: '10px',
          marginTop: '20px',
        }}
      >
        <p style={{ color: '#777' }}>
          {originalNotes}
        </p>
      </div>
    </div>
  );
};

export default SimplificationView;
