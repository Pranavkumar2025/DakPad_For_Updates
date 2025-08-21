import React, { useState, useEffect } from "react";

const AddCaseForm = ({ isOpen, onClose }) => {
  const [randomId, setRandomId] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);


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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md bg-opacity-30 flex  items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-lg p-8 relative">
        <h2 className="text-xl font-semibold mb-4 text-[#ff5010]">
          Add New Application
        </h2>


        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="size-5"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <p className="text-sm py-2 ">
          {" "}
          Application ID:{" "}
          <span className="text-xs text-gray-500">{randomId}</span>
        </p>
        <form className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Applicant Name</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
              placeholder="Enter case title"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Application Date</label>
            <input
              type="date"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
              placeholder="Enter case type"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone Number</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
              placeholder="+91 223 4456 123"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Email ID</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
              placeholder="example@hello.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Source At</label>
            <select className="w-full mt-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5010]">
              <option className="text-gray-200" value="" disabled selected>
                Select source
              </option>
              <option value="hr">In-person</option>
              <option value="engineering">MP/MLA</option>
              <option value="marketing">Whatsapp</option>
              <option value="sales">Email</option>
              <option value="finance">Newspaper</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500">Subject</label>
            <input
              type="phone"
              className="w-full mt-1 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5010]"
              placeholder="Enter subject"
            />
          </div>


          {/* Full width field */}
          <div>
            <label className="text-sm text-gray-500">
              Attach Application PDF
            </label>
            <div class="w-full mt-2 py-2 bg-gray-50 rounded-2xl border border-gray-300 gap-3 grid border-dashed">
              <div class="grid gap-1">
                <svg
                  class="mx-auto"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="File">
                    <path
                      id="icon"
                      d="M31.6497 10.6056L32.2476 10.0741L31.6497 10.6056ZM28.6559 7.23757L28.058 7.76907L28.058 7.76907L28.6559 7.23757ZM26.5356 5.29253L26.2079 6.02233L26.2079 6.02233L26.5356 5.29253ZM33.1161 12.5827L32.3683 12.867V12.867L33.1161 12.5827ZM31.8692 33.5355L32.4349 34.1012L31.8692 33.5355ZM24.231 11.4836L25.0157 11.3276L24.231 11.4836ZM26.85 14.1026L26.694 14.8872L26.85 14.1026ZM11.667 20.8667C11.2252 20.8667 10.867 21.2248 10.867 21.6667C10.867 22.1085 11.2252 22.4667 11.667 22.4667V20.8667ZM25.0003 22.4667C25.4422 22.4667 25.8003 22.1085 25.8003 21.6667C25.8003 21.2248 25.4422 20.8667 25.0003 20.8667V22.4667ZM11.667 25.8667C11.2252 25.8667 10.867 26.2248 10.867 26.6667C10.867 27.1085 11.2252 27.4667 11.667 27.4667V25.8667ZM20.0003 27.4667C20.4422 27.4667 20.8003 27.1085 20.8003 26.6667C20.8003 26.2248 20.4422 25.8667 20.0003 25.8667V27.4667ZM23.3337 34.2H16.667V35.8H23.3337V34.2ZM7.46699 25V15H5.86699V25H7.46699ZM32.5337 15.0347V25H34.1337V15.0347H32.5337ZM16.667 5.8H23.6732V4.2H16.667V5.8ZM23.6732 5.8C25.2185 5.8 25.7493 5.81639 26.2079 6.02233L26.8633 4.56274C26.0191 4.18361 25.0759 4.2 23.6732 4.2V5.8ZM29.2539 6.70608C28.322 5.65771 27.7076 4.94187 26.8633 4.56274L26.2079 6.02233C26.6665 6.22826 27.0314 6.6141 28.058 7.76907L29.2539 6.70608ZM34.1337 15.0347C34.1337 13.8411 34.1458 13.0399 33.8638 12.2984L32.3683 12.867C32.5216 13.2702 32.5337 13.7221 32.5337 15.0347H34.1337ZM31.0518 11.1371C31.9238 12.1181 32.215 12.4639 32.3683 12.867L33.8638 12.2984C33.5819 11.5569 33.0406 10.9662 32.2476 10.0741L31.0518 11.1371ZM16.667 34.2C14.2874 34.2 12.5831 34.1983 11.2872 34.0241C10.0144 33.8529 9.25596 33.5287 8.69714 32.9698L7.56577 34.1012C8.47142 35.0069 9.62375 35.4148 11.074 35.6098C12.5013 35.8017 14.3326 35.8 16.667 35.8V34.2ZM5.86699 25C5.86699 27.3344 5.86529 29.1657 6.05718 30.593C6.25217 32.0432 6.66012 33.1956 7.56577 34.1012L8.69714 32.9698C8.13833 32.411 7.81405 31.6526 7.64292 30.3798C7.46869 29.0839 7.46699 27.3796 7.46699 25H5.86699ZM23.3337 35.8C25.6681 35.8 27.4993 35.8017 28.9266 35.6098C30.3769 35.4148 31.5292 35.0069 32.4349 34.1012L31.3035 32.9698C30.7447 33.5287 29.9863 33.8529 28.7134 34.0241C27.4175 34.1983 25.7133 34.2 23.3337 34.2V35.8ZM32.5337 25C32.5337 27.3796 32.532 29.0839 32.3577 30.3798C32.1866 31.6526 31.8623 32.411 31.3035 32.9698L32.4349 34.1012C33.3405 33.1956 33.7485 32.0432 33.9435 30.593C34.1354 29.1657 34.1337 27.3344 34.1337 25H32.5337ZM7.46699 15C7.46699 12.6204 7.46869 10.9161 7.64292 9.62024C7.81405 8.34738 8.13833 7.58897 8.69714 7.03015L7.56577 5.89878C6.66012 6.80443 6.25217 7.95676 6.05718 9.40704C5.86529 10.8343 5.86699 12.6656 5.86699 15H7.46699ZM16.667 4.2C14.3326 4.2 12.5013 4.1983 11.074 4.39019C9.62375 4.58518 8.47142 4.99313 7.56577 5.89878L8.69714 7.03015C9.25596 6.47133 10.0144 6.14706 11.2872 5.97592C12.5831 5.8017 14.2874 5.8 16.667 5.8V4.2ZM23.367 5V10H24.967V5H23.367ZM28.3337 14.9667H33.3337V13.3667H28.3337V14.9667ZM23.367 10C23.367 10.7361 23.3631 11.221 23.4464 11.6397L25.0157 11.3276C24.9709 11.1023 24.967 10.8128 24.967 10H23.367ZM28.3337 13.3667C27.5209 13.3667 27.2313 13.3628 27.0061 13.318L26.694 14.8872C27.1127 14.9705 27.5976 14.9667 28.3337 14.9667V13.3667ZM23.4464 11.6397C23.7726 13.2794 25.0543 14.5611 26.694 14.8872L27.0061 13.318C26.0011 13.1181 25.2156 12.3325 25.0157 11.3276L23.4464 11.6397ZM11.667 22.4667H25.0003V20.8667H11.667V22.4667ZM11.667 27.4667H20.0003V25.8667H11.667V27.4667ZM32.2476 10.0741L29.2539 6.70608L28.058 7.76907L31.0518 11.1371L32.2476 10.0741Z"
                      fill="#ff5010"
                    />
                  </g>
                </svg>
                <h2 class="text-center text-gray-400   text-xs leading-4">
                  PDF, smaller than 5MB
                </h2>
              </div>
              <div class="grid gap-2">
                <h4 class="text-center text-gray-900 text-sm font-medium leading-snug">
                  Drag and Drop your file here or
                </h4>
                <div class="flex items-center justify-center">
                  <label>
                    <input type="file" hidden />
                    <div class="flex w-28 h-9 px-2 flex-col border border-[#ff5010]  rounded-full shadow text-gray-600 text-xs font-semibold leading-4 items-center justify-center cursor-pointer focus:outline-none">
                      Choose File
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Attach Application Photo
            </label>
            <div class="w-full py-2 mt-2 bg-gray-50 rounded-2xl border border-gray-300 gap-3 grid border-dashed">
              <div class="grid gap-1">
                <svg
                  class="mx-auto"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="File">
                    <path
                      id="icon"
                      d="M31.6497 10.6056L32.2476 10.0741L31.6497 10.6056ZM28.6559 7.23757L28.058 7.76907L28.058 7.76907L28.6559 7.23757ZM26.5356 5.29253L26.2079 6.02233L26.2079 6.02233L26.5356 5.29253ZM33.1161 12.5827L32.3683 12.867V12.867L33.1161 12.5827ZM31.8692 33.5355L32.4349 34.1012L31.8692 33.5355ZM24.231 11.4836L25.0157 11.3276L24.231 11.4836ZM26.85 14.1026L26.694 14.8872L26.85 14.1026ZM11.667 20.8667C11.2252 20.8667 10.867 21.2248 10.867 21.6667C10.867 22.1085 11.2252 22.4667 11.667 22.4667V20.8667ZM25.0003 22.4667C25.4422 22.4667 25.8003 22.1085 25.8003 21.6667C25.8003 21.2248 25.4422 20.8667 25.0003 20.8667V22.4667ZM11.667 25.8667C11.2252 25.8667 10.867 26.2248 10.867 26.6667C10.867 27.1085 11.2252 27.4667 11.667 27.4667V25.8667ZM20.0003 27.4667C20.4422 27.4667 20.8003 27.1085 20.8003 26.6667C20.8003 26.2248 20.4422 25.8667 20.0003 25.8667V27.4667ZM23.3337 34.2H16.667V35.8H23.3337V34.2ZM7.46699 25V15H5.86699V25H7.46699ZM32.5337 15.0347V25H34.1337V15.0347H32.5337ZM16.667 5.8H23.6732V4.2H16.667V5.8ZM23.6732 5.8C25.2185 5.8 25.7493 5.81639 26.2079 6.02233L26.8633 4.56274C26.0191 4.18361 25.0759 4.2 23.6732 4.2V5.8ZM29.2539 6.70608C28.322 5.65771 27.7076 4.94187 26.8633 4.56274L26.2079 6.02233C26.6665 6.22826 27.0314 6.6141 28.058 7.76907L29.2539 6.70608ZM34.1337 15.0347C34.1337 13.8411 34.1458 13.0399 33.8638 12.2984L32.3683 12.867C32.5216 13.2702 32.5337 13.7221 32.5337 15.0347H34.1337ZM31.0518 11.1371C31.9238 12.1181 32.215 12.4639 32.3683 12.867L33.8638 12.2984C33.5819 11.5569 33.0406 10.9662 32.2476 10.0741L31.0518 11.1371ZM16.667 34.2C14.2874 34.2 12.5831 34.1983 11.2872 34.0241C10.0144 33.8529 9.25596 33.5287 8.69714 32.9698L7.56577 34.1012C8.47142 35.0069 9.62375 35.4148 11.074 35.6098C12.5013 35.8017 14.3326 35.8 16.667 35.8V34.2ZM5.86699 25C5.86699 27.3344 5.86529 29.1657 6.05718 30.593C6.25217 32.0432 6.66012 33.1956 7.56577 34.1012L8.69714 32.9698C8.13833 32.411 7.81405 31.6526 7.64292 30.3798C7.46869 29.0839 7.46699 27.3796 7.46699 25H5.86699ZM23.3337 35.8C25.6681 35.8 27.4993 35.8017 28.9266 35.6098C30.3769 35.4148 31.5292 35.0069 32.4349 34.1012L31.3035 32.9698C30.7447 33.5287 29.9863 33.8529 28.7134 34.0241C27.4175 34.1983 25.7133 34.2 23.3337 34.2V35.8ZM32.5337 25C32.5337 27.3796 32.532 29.0839 32.3577 30.3798C32.1866 31.6526 31.8623 32.411 31.3035 32.9698L32.4349 34.1012C33.3405 33.1956 33.7485 32.0432 33.9435 30.593C34.1354 29.1657 34.1337 27.3344 34.1337 25H32.5337ZM7.46699 15C7.46699 12.6204 7.46869 10.9161 7.64292 9.62024C7.81405 8.34738 8.13833 7.58897 8.69714 7.03015L7.56577 5.89878C6.66012 6.80443 6.25217 7.95676 6.05718 9.40704C5.86529 10.8343 5.86699 12.6656 5.86699 15H7.46699ZM16.667 4.2C14.3326 4.2 12.5013 4.1983 11.074 4.39019C9.62375 4.58518 8.47142 4.99313 7.56577 5.89878L8.69714 7.03015C9.25596 6.47133 10.0144 6.14706 11.2872 5.97592C12.5831 5.8017 14.2874 5.8 16.667 5.8V4.2ZM23.367 5V10H24.967V5H23.367ZM28.3337 14.9667H33.3337V13.3667H28.3337V14.9667ZM23.367 10C23.367 10.7361 23.3631 11.221 23.4464 11.6397L25.0157 11.3276C24.9709 11.1023 24.967 10.8128 24.967 10H23.367ZM28.3337 13.3667C27.5209 13.3667 27.2313 13.3628 27.0061 13.318L26.694 14.8872C27.1127 14.9705 27.5976 14.9667 28.3337 14.9667V13.3667ZM23.4464 11.6397C23.7726 13.2794 25.0543 14.5611 26.694 14.8872L27.0061 13.318C26.0011 13.1181 25.2156 12.3325 25.0157 11.3276L23.4464 11.6397ZM11.667 22.4667H25.0003V20.8667H11.667V22.4667ZM11.667 27.4667H20.0003V25.8667H11.667V27.4667ZM32.2476 10.0741L29.2539 6.70608L28.058 7.76907L31.0518 11.1371L32.2476 10.0741Z"
                      fill="#ff5010"
                    />
                  </g>
                </svg>
                <h2 class="text-center text-gray-400   text-xs leading-4">
                  PNG, JPG smaller than 2MB
                </h2>
              </div>
              <div class="grid gap-2">
                <h4 class="text-center text-gray-900 text-sm font-medium leading-snug">
                  Drag and Drop your file here or
                </h4>
                <div class="flex items-center justify-center">
                  <label>
                    <input type="file" hidden />
                    <div class="flex w-28 h-9 px-2 flex-col border border-[#ff5010] rounded-full shadow text-gray-600 text-xs font-semibold leading-4 items-center justify-center cursor-pointer focus:outline-none">
                      Choose File
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full col-span-2 flex gap-5">
            <button
              onClick={onClose}
              type="submit"
              className="w-full border border-gray-300 text-gray-700 px-6 py-2 rounded-xl"
            >
              cancel
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              className="w-full bg-[#ff5010] text-white px-6 py-2 rounded-xl hover:bg-[#e6490f]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white w-[90%] max-w-sm rounded-2xl shadow-2xl p-6 relative animate-fadeIn">
            {/* Close Button (optional if needed in future) */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Animation */}
            <video
              src="/Animation.webm"
              autoPlay
              className="w-24 h-24 mx-auto rounded-lg mb-4 object-cover"
            />

            {/* Title */}
            <h2 className="text-2xl font-semibold text-center text-green-600 mb-1">
              Application Added!
            </h2>

            {/* Subtitle */}
            <p className="text-center text-sm text-gray-600">
              Sent to <span className="font-medium">Health Department</span>
            </p>

            {/* Info Section */}
            <div className="mt-6 bg-white border border-gray-300 rounded-2xl overflow-hidden w-full max-w-md mx-auto">
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-300">
                  <tr>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-700">
                      Field
                    </th>
                    <th className="text-left px-5 py-3 text-sm font-medium text-gray-700">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <tr className="border-t border-gray-300">
                    <td className="px-5 py-3 font-semibold">Applicant</td>
                    <td className="px-5 py-3">Aditya Kumar</td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="px-5 py-3 font-semibold">Applicant ID</td>
                    <td className="px-5 py-3">{randomId}</td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="px-5 py-3 font-semibold">
                      Date of receiving
                    </td>
                    <td className="px-5 py-3">04/07/2025</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Print Button */}
            <div className="flex justify-center mt-6">
              <button className="inline-flex items-center gap-2 text-white bg-[#ff5010] hover:bg-[#e6490f] px-4 py-2 rounded-full shadow-md transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0 1 18 8.653v4.097A2.25 2.25 0 0 1 15.75 15h-.241l.305 1.984A1.75 1.75 0 0 1 14.084 19H5.915a1.75 1.75 0 0 1-1.73-2.016L4.492 15H4.25A2.25 2.25 0 0 1 2 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.127-.153L5 6.25v-3.5Zm8.5 3.397a41.533 41.533 0 0 0-7 0V2.75a.25.25 0 0 1 .25-.25h6.5a.25.25 0 0 1 .25.25v3.397ZM6.608 12.5a.25.25 0 0 0-.247.212l-.693 4.5a.25.25 0 0 0 .247.288h8.17a.25.25 0 0 0 .246-.288l-.692-4.5a.25.25 0 0 0-.247-.212H6.608Z"
                    clipRule="evenodd"
                  />
                </svg>
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
