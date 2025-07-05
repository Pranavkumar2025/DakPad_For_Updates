import React, { useState, useEffect } from "react";

const AddCaseForm = () => {
  const [randomId, setRandomId] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);

    // Hide the modal after 10 seconds
    setTimeout(() => {
      setShowModal(false);
    }, 10000);
  };

  const generateRandomId = () => {
    const id = Math.floor(100000 + Math.random() * 900000);
    return id.toString();
  };

  useEffect(() => {
    const id = generateRandomId();
    setRandomId(id);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-lg p-8 relative">
        <h2 className="text-xl font-semibold mb-4 text-[#ff5010]">
          Add New Application
        </h2>

        <p className="text-sm py-2">
          Application ID:{" "}
          <span className="text-xs text-gray-500">{randomId}</span>
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Form Fields */}
          <div>
            <label className="text-sm text-gray-500">Applicant Name</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl focus:ring-[#ff5010]"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Application Date</label>
            <input
              type="date"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl focus:ring-[#ff5010]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Phone Number</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl"
              placeholder="+91 223 4456 123"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email ID</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl"
              placeholder="example@hello.com"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Source At</label>
            <select className="w-full mt-1 p-2 border border-gray-300 rounded-xl">
              <option value="">Select source</option>
              <option value="inperson">In-person</option>
              <option value="mla">MP/MLA</option>
              <option value="whatsapp">Whatsapp</option>
              <option value="email">Email</option>
              <option value="news">Newspaper</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500">Subject</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl"
              placeholder="Enter subject"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Department</label>
            <select className="w-full mt-1 p-2 border border-gray-300 rounded-xl">
              <option value="">Select department</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="finance">Finance</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500">Table</label>
            <select className="w-full mt-1 p-2 border border-gray-300 rounded-xl">
              <option value="">Select table</option>
              <option value="1">Table 1</option>
              <option value="2">Table 2</option>
              <option value="3">Table 3</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-500">Attach Application PDF</label>
            <input type="file" accept=".pdf" className="w-full mt-1 p-2 border border-gray-300 rounded-xl" />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-500">Attach Application Photo</label>
            <input type="file" accept="image/*" className="w-full mt-1 p-2 border border-gray-300 rounded-xl" />
          </div>

          {/* Submit Button */}
          <div className="w-full col-span-2 flex gap-5">
            <button
              type="reset"
              className="w-full border border-gray-300 text-gray-700 px-6 py-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-[#ff5010] text-white px-6 py-2 rounded-xl hover:bg-[#e6490f]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Modal after Submit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-sm rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-semibold text-center text-green-600 mb-1">
              Application Added!
            </h2>
            <p className="text-center text-sm text-gray-600 mb-4">
              Sent to <span className="font-medium">Health Department</span>
            </p>

            <div className="mt-2 bg-white border border-gray-300 rounded-2xl">
              <table className="w-full">
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-semibold">Applicant</td>
                    <td className="px-4 py-2">Aditya Kumar</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-semibold">Applicant ID</td>
                    <td className="px-4 py-2">{randomId}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2 font-semibold">Date</td>
                    <td className="px-4 py-2">04/07/2025</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <button className="bg-[#ff5010] hover:bg-[#e6490f] text-white px-4 py-2 rounded-full shadow-md">
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCaseForm;
