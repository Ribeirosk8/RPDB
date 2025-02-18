'use client';
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import * as d3 from 'd3';
import Select from 'react-select';

const ParallelCoordinates: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);

  useEffect(() => {
    // Load the CSV file
    const loadCSV = async () => {
      try {
        const csvData = await d3.csv('/files/Cleaned_Concrete_distresses.csv');
        // Convert categorical columns to numerical values

        // // Filter data for districts "04 - AMARILLO" and "05 - LUBBOCK"
        // const filteredData = csvData.filter(
        //     (row) => row['district'] === '04 - AMARILLO' || row['district'] === '05 - LUBBOCK'
        //   );

        // setData(filteredData);

        setData(csvData);
        // Set initial selected columns based on the data keys
        const initialColumns = Object.keys(csvData[0]).map(key => ({ value: key, label: key }));
        setSelectedColumns(initialColumns);
      } catch (error) {
        console.error('Error loading CSV file:', error);
      }
    };
    loadCSV();
  }, []);

  if (data.length === 0) {
    return <div>Loading...</div>;
  }

//   // Extract column names and process data
//   const dimensions = Object.keys(data[0]).map((key) => ({
//     label: key,
//     values: data.map((row) => Number(row[key])),
//   }));

  // Extract dimensions based on selected columns
  const dimensions = selectedColumns.map((col) => ({
    label: col.label,
    values: data.map((row) => Number(row[col.value])),
  }));

  return (
    <div style={{ width: '100%', height: "90vh" }}>
    <Select
      isMulti
      options={Object.keys(data[0]).map(key => ({ value: key, label: key }))}
      onChange={setSelectedColumns}
      placeholder="Select columns..."
      className="basic-multi-select"
      classNamePrefix="select"
    />
    <Plot useResizeHandler={true} style={{width: "100%", height: "100%"}}
      data={[
        {
          type: 'parcoords',
          line: { color: 'blue' },
          dimensions: dimensions,
        },
      ]}
      layout={{
        title: 'Parallel Coordinates Plot',
        autosize: true, // This allows the plot to resize automatically
        width: undefined,  // Allow full responsiveness
        height: undefined, // Allow full responsiveness
      }}
      config={{
        responsive: true, // Make the plot responsive
      }}
    />
    </div>
  );
};

export default ParallelCoordinates;