import React, { useState } from 'react';

const TagTable = () => {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    tagName: '',
    status: '',
    subscriptionRate: '',
    dataType: '',
  });

  const handleInputChange = (e) => {
    setNewRow({ ...newRow, [e.target.name]: e.target.value });
  };

  const addRow = () => {
    if (!newRow.tagName) return alert("Tag Name is required");
    setRows([...rows, newRow]);
    setNewRow({
        variableName:'',
      tagName: '',
      status: '',
      subscriptionRate: '',
      dataType: '',
    });
  };

  return (
    <div className=" max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Tag Table</h2>

      {/* Table */}
      <table className="min-w-full border border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
          <th className="border p-2">Variable Name</th>
            <th className="border p-2">Tag Name</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Subscription Rate</th>
            <th className="border p-2">DataType</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">No rows added yet</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2">{row.tagName}</td>
                <td className="border p-2">{row.status}</td>
                <td className="border p-2">{row.subscriptionRate}</td>
                <td className="border p-2">{row.dataType}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Input Form */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-5 gap-4 ">
      <input
          name="variableName"
          placeholder="Variable Name"
          value={newRow.variableName}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          name="tagName"
          placeholder="Tag Name"
          value={newRow.tagName}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          name="status"
          placeholder="Status"
          value={newRow.status}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          name="subscriptionRate"
          placeholder="Subscription Rate"
          value={newRow.subscriptionRate}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          name="dataType"
          placeholder="Data Type"
          value={newRow.dataType}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
      </div>

      <button
        onClick={addRow}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Row
      </button>
    </div>
  );
};

export default TagTable;
