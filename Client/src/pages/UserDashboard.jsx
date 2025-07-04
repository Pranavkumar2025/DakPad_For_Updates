import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRegClock } from 'react-icons/fa';
import { GrCompliance } from 'react-icons/gr';
import { RiCloseCircleLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import backimg from '../assets/back4.jpeg';
import UserNavbar from '../components/UserNavbar';

const UserDashboard = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [userMessage, setUserMessage] = useState('');

  const navigate = useNavigate();

  const handleNewApplication = () => {
    navigate('/application-form');
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/cases')
      .then(res => {
        setCases(res.data);
        setFilteredCases(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const result = cases.filter(c =>
      c.applicantName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCases(result);
  }, [searchTerm, cases]);

  const getStatusBadge = (status) => {
    let color = '', icon = null;
    if (status === 'Pending') {
      color = 'bg-[#13c2FF]'; icon = <FaRegClock />;
    } else if (status === 'Compliance') {
      color = 'bg-[#13B56C]'; icon = <GrCompliance />;
    } else {
      color = 'bg-[#0969F9]'; icon = <RiCloseCircleLine />;
    }
    return (
      <span className={`inline-flex items-center gap-2 text-white px-3 py-1 rounded-full text-xs ${color}`}>
        {icon}
        {status}
      </span>
    );
  };

  const handleUserMessageSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || !selectedCase) return;

    try {
      await axios.post(`http://localhost:5000/api/cases/${selectedCase.id}/message`, {
        message: userMessage.trim(),
        from: 'user'
      });

      const updatedCase = {
        ...selectedCase,
        messages: [...(selectedCase.messages || []), {
          message: userMessage.trim(),
          from: 'user',
          date: new Date().toISOString().split('T')[0]
        }]
      };
      setSelectedCase(updatedCase);
      setUserMessage('');
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${backimg})` }}
    >
      <div className="backdrop-blur-sm bg-white/70 min-h-screen">
        <UserNavbar />

        {/* Main Content */}
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-700">Dashboard</h2>
            <button
              onClick={handleNewApplication}
              className="bg-[#13c2FF] hover:bg-[#0f9cd5] text-white text-sm font-medium px-4 py-2 rounded-md shadow"
            >
              + New Application
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by your name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 mb-6 rounded-md w-full max-w-md shadow-sm"
          />

          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md min-h-96 bg-white bg-opacity-80">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-100 text-gray-600 text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">Sr. No</th>
                  <th className="px-4 py-2 text-left">Applicant's Name</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Date of Application</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">View Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem, idx) => (
                  <tr
                    key={caseItem.id}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCase(caseItem)}
                  >
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{caseItem.applicantName}</td>
                    <td className="px-4 py-2">{caseItem.title}</td>
                    <td className="px-4 py-2">{caseItem.dateOfApplication}</td>
                    <td className="px-4 py-2">{getStatusBadge(caseItem.status)}</td>
                    <td className="px-4 py-2 text-blue-600 hover:underline text-xs">View</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {selectedCase && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Case Timeline & Messages</h3>
                  <button onClick={() => setSelectedCase(null)} className="text-gray-600 text-xl hover:text-red-500">&times;</button>
                </div>

                <div className="text-sm space-y-3 text-gray-700 mb-4">
                  <p><strong>Applicant:</strong> {selectedCase.applicantName}</p>
                  <p><strong>Title:</strong> {selectedCase.title}</p>
                  <p><strong>Date:</strong> {selectedCase.dateOfApplication}</p>
                  <p><strong>Description:</strong> {selectedCase.description}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedCase.status)}</p>
                </div>

                <h4 className="text-gray-800 font-semibold mb-2">Timeline</h4>
                <div className="border-l-2 border-[#ff5010] pl-4 space-y-4 text-sm mb-6">
                  {selectedCase.timeline?.length ? (
                    selectedCase.timeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-2 top-1 w-3 h-3 bg-[#ff5010] rounded-full shadow-md"></div>
                        <p className="font-semibold text-[#ff5010]">{item.section}</p>
                        <p className="text-gray-600 italic">{item.comment}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No timeline entries.</p>
                  )}
                </div>

                <h4 className="text-gray-800 font-semibold mb-2">Messages</h4>
                <div className="space-y-2 mb-4">
                  {selectedCase.messages?.length > 0 ? (
                    selectedCase.messages.map((msg, idx) => (
                      <div key={idx} className={`text-sm p-3 rounded-md ${msg.from === 'user' ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                        <p className="mb-1"><strong>{msg.from === 'user' ? 'You' : 'Admin'}:</strong></p>
                        <p className="text-gray-700">{msg.message}</p>
                        <p className="text-xs text-gray-400">{msg.date}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No messages yet.</p>
                  )}
                </div>

                <form onSubmit={handleUserMessageSubmit} className="mt-4 space-y-2">
                  <textarea
                    rows={3}
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message to admin..."
                    className="w-full border px-3 py-2 rounded-md text-sm border-gray-300"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#13c2FF] text-white py-2 text-sm font-medium rounded-md hover:bg-[#0f9cd5] transition"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
