import React, { useState, useEffect } from 'react';
import './App.css';
import bannerImage from './Easy ABLLS-r.png'; // Import the banner image
import { saveAs } from 'file-saver';

const App = () => {
  // Function to parse TSV data
  const parseTSVToDict = (tsv) => {
    const lines = tsv.trim().split('\n');
    const headers = lines[0].split('\t');
    const data = lines.slice(1).map((line) => {
      const values = line.split('\t');
      let entry = {};
      headers.forEach((header, index) => {
        entry[header] = values[index];
      });
      return entry;
    });
    return data;
  };

  const [dataList, setTsvData] = useState([]);
  
  useEffect(() => {
    fetch('ablls-info-f-col.tsv')
      .then((response) => response.text())
      .then((text) => {
        const dict = parseTSVToDict(text);
        setTsvData(dict);
      })
      .catch((error) => {
        console.error('Error reading TSV file:', error);
      });
  }, []);

  const [showTable, setShowTable] = useState(false);
  const [chosenOptions, setChosenOptions] = useState(Array(dataList.length).fill("None")); 

  // Function to show the table page
  const handleStart = () => {
    setShowTable(true);
  };

  // Function to go back to the home page
  const handleHome = () => {
    setShowTable(false);
  };

  // Function to handle option selection
  const handleOptionSelect = async (rowIndex, option, id) => {
    const newChosenOptions = [...chosenOptions];
    newChosenOptions[rowIndex] = option; // Update the chosen option for the specific row
    setChosenOptions(newChosenOptions);

    let category = id[0].charCodeAt(0) - 65; // 65 is the char code for 'A'
    let task = parseInt(id.slice(1)) - 1

    console.log(category, task, parseInt(option))
    const response = await fetch('https://dak4okeo4c.execute-api.us-east-2.amazonaws.com/dev/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "category": category,
        "behavior": task,
        "score": parseInt(option),
        "timestamp": new Date().toISOString(),
      }),
    });
    // Scroll to the next row automatically after selection
    const nextRow = rowIndex + 1;
    if (nextRow < dataList.length) {
      const nextRowElement = document.getElementById(`row-${nextRow}`);
      if (nextRowElement) {
        nextRowElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Function to clear the scores
  const clearScores = () => {
    setChosenOptions(Array(dataList.length).fill("None")); 
  };

  // Function to retrieve PDF
  const retrievePdf = async () => {
    // Logic for PDF retrieval can be added here
    const response = await fetch('https://dak4okeo4c.execute-api.us-east-2.amazonaws.com/dev/download', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // MIME type for Excel files
      },
      
    });
    // Get the file as Blob (binary data)
    const blob = await response.blob();

    // Create a URL for the blob and trigger the download
    const fileName = 'your-excel-file.xlsx'; // You can dynamically set this
    saveAs(blob, fileName); // Using FileSaver.js to trigger download
    console.log("Retrieve PDF clicked");
  };

  return (dataList.length > 0 ?
    <div className="container">
      {/* Home Page */}
      {!showTable && (
        <div className="front-page">
          <div className="banner">
            <img src={bannerImage} alt="Banner" className="banner-image" />
          </div>
          <h1>Easy ABLLS-R</h1>
          <p>Welcome to the ABLLS-R assessment tool.</p>
          <button className="start-button" onClick={handleStart}>
            Start
          </button>
        </div>
      )}

      {/* Table Page */}
      {showTable && (
        <div className="table-page">
          <button className="home-button" onClick={handleHome}>
            Home
          </button>
          <h1>ABLLS-R Table</h1>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Score</th>
                  <th>Score Selected</th>
                  <th>Task Name</th>
                  <th>Task Objective</th>
                  <th>Question</th>
                  <th>Examples</th>
                  <th>Criteria</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {dataList.map((item, index) => (
                  <tr key={item.id} id={`row-${index}`}>
                    <td>{item.id}</td>
                    <td>
                      {Array.from({ length: 5 }, (_, optionIndex) => (
                        <button key={optionIndex} onClick={() => handleOptionSelect(index, `${optionIndex}`, item.id)}>
                          {optionIndex}
                        </button>
                      ))}
                    </td>
                    <td>{chosenOptions[index]}</td>
                    <td>{item.TaskName}</td>
                    <td>{item.TaskObjective}</td>
                    <td>{item.Question}</td>
                    <td>{item.Examples}</td>
                    <td>{item.Criteria}</td>
                    <td>{item.Notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="button-container">
            <button className="clear-button" onClick={clearScores}>
              Clear Scores
            </button>
            <button className="retrieve-pdf-button" onClick={retrievePdf}>
              Retrieve PDF
            </button>
          </div>
        </div>
      )}
    </div> : <p>loading...</p>
  );
};

export default App;
