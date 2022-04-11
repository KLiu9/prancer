'use strict';

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import Button from '@material-ui/core/Button';
import DragDrop from './DragDrop';
import { save_annotations, get_json_file, get_filenames } from '../../utils/http_functions';
import { TextFieldsOutlined } from '@material-ui/icons';

const SimplificationView = (locJson) => {

  let fileReader;
  const gridRef = useRef();
  const gridStyle = useMemo(() => ({ height: '400px', width: '100%' }), []);
  const [rowData, setRowData] = useState([{},{},{},{},{},{},{}]);
  const [location] = useState(locJson);
  const [filename, setFilename] = useState('');
  const [gridData, setGridData] = useState([{}]);
  const [originalNotes, setOriginalNotes] = useState('');
  const [objArray, setObjArray] = useState([]);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(true);
  const [columnDefs] = useState([
    { headerName: "Original", field: "oldtext", cellStyle: {'wordBreak': 'normal'}},
    { headerName: "Simplified", field: "text", editable: true,  cellStyle: {'wordBreak': 'normal'}}
  ]);

  useEffect(() => {
    window.MyNamespace = {};
    window.MyNamespace["fileIndex"] = 0;
    window.MyNamespace["fileNames"] = [];
    //console.log("useEffect");
    //console.log(location.params);
    if (Object.hasOwn(location.params, 'fileId')) { // from simplifiedFiles page
      let myid = location.params.fileId;
      let names = location.params.fileNames.split(';');
      let index = Array.indexOf(names, myid);
      window.MyNamespace["fileIndex"] = index;
      window.MyNamespace["fileNames"] = names;
      fetchData(names[index]);
      setPrevDisabled(disablePrevious());
      setNextDisabled(disableNext());
    }
  }, []); 

  async function fetchFileNames() {
    const filenames = get_filenames('simplified', '.json');
    const data = await filenames.then((response) => response.data);
    let names = data.filenames;
    let myid  = filename.substring(0, filename.length - 5);
    let index = Array.indexOf(names, myid);
    window.MyNamespace["fileIndex"] = index;
    window.MyNamespace["fileNames"] = names;
    setPrevDisabled(disablePrevious());
    setNextDisabled(disableNext());
}

  const loadDataToGrid = ((objArray) => {
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
  });

  async function fetchData(id) {
    setFilename(id.concat('.json')); // ok
    const file = get_json_file(id, 'simplified');
    const data = await file.then((response) => response.data);
    let objArray = JSON.parse(data.file.annotations);
    loadDataToGrid(objArray);
  };

  const loadPrevious = useCallback(() => {
    let index = window.MyNamespace['fileIndex'];
    window.MyNamespace['fileIndex'] = index - 1;
    let names = window.MyNamespace['fileNames'];
    fetchData(names[index-1]);
    setPrevDisabled(disablePrevious());
    setNextDisabled(disableNext());
},[]);

  const loadNext = useCallback(() => {
    let index = window.MyNamespace['fileIndex'];
    window.MyNamespace['fileIndex'] = index + 1;
    let names = window.MyNamespace['fileNames'];
    fetchData(names[index+1]);
    setPrevDisabled(disablePrevious());
    setNextDisabled(disableNext());
},[]);

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
      wrapText: true,
      //autoHeight: true,
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
    loadDataToGrid(objArray);
  };

  const handleFileChange = useCallback((file) => {
    setFilename(file.name);
    fileReader = new FileReader();
    const blob = new Blob([file], { type: "application/json" });
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(blob); 
  },[]);

  async function handleSaveAnnotations () {
    const {api, columnApi} = gridRef.current;
    // api's will be null before grid initialised
    if (api == null || columnApi == null) { return; }
    let rowData = [];
    api.forEachNode(node => rowData.push(node.data));
    let map = {};
    rowData.forEach(row => { map[row.oldtext] = row.text });
    objArray.forEach(obj => { obj.text = map[obj.oldtext] }); // add back duplicate texts
    const myannotations = objArray.slice();
    myannotations.unshift({ "original" : originalNotes }); // add original text to json output    
    const annotations = save_annotations(filename.substring(0, filename.length - 5), myannotations, "simplified");
    const data = await annotations.then((response) => response.data);
    fetchFileNames();
  }

  const disablePrevious = () => {
    return (!window.MyNamespace || window.MyNamespace['fileIndex'] == 0) ? true : false;
  }

  const disableNext = () => {
    return (!window.MyNamespace || 
      window.MyNamespace['fileIndex'] == (window.MyNamespace['fileNames'].length - 1)) ? true : false;
  }

  return (
    <div>
      {/* <b>Upload a json file: </b> */}
      {/* <DragDrop onRefresh={handleFileChange}/> */}
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
        <Button
              className='hover-state'
              variant={'contained'}
              onClick={loadPrevious}
              color="primary"
              disabled={prevDisabled} 
            >
            Previous
        </Button>
        <Button
              className='hover-state'
              variant={'contained'}
              onClick={loadNext}
              color="primary"
              disabled={nextDisabled}
            >
            Next
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