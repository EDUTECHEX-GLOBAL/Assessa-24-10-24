import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Make sure to install this package
import { BiArrowBack } from "react-icons/bi"; // Import back arrow icon

const AssessmentLibrary = ({ onBack }) => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      const teacherInfo = JSON.parse(localStorage.getItem("teacherInfo"));
      const token = teacherInfo?.token;

      if (!token) {
        console.warn("No token found, redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const { data } = await axios.get("/api/assessments/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAssessments(data);
        setFilteredAssessments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assessments", error);
        setLoading(false);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchAssessments();
  }, [navigate]);

  // Extract unique subjects for filters
  const subjects = ["All", ...new Set(assessments.map(a => a.subject))];

  // Filter assessments based on active filter and search query
  useEffect(() => {
    let result = assessments;
    
    if (activeFilter !== "All") {
      result = result.filter(a => a.subject === activeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.assessmentName.toLowerCase().includes(query) || 
        a.subject.toLowerCase().includes(query) ||
        a.gradeLevel.toString().includes(query)
      );
    }
    
    setFilteredAssessments(result);
  }, [activeFilter, searchQuery, assessments]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteAssessment = async (assessmentId) => {
    if (isDeleting) return;
    
    if (!window.confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const teacherInfo = JSON.parse(localStorage.getItem("teacherInfo"));
    const token = teacherInfo?.token;

    try {
      await axios.delete(`/api/assessments/${assessmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the assessments list
      const updatedAssessments = assessments.filter(a => a._id !== assessmentId);
      setAssessments(updatedAssessments);
      toast.success("Assessment deleted successfully");
    } catch (error) {
      console.error("Error deleting assessment", error);
      toast.error("Failed to delete assessment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-amber-600 hover:text-amber-500 font-medium"
        >
          <BiArrowBack className="text-xl" />
          Back to Dashboard
        </button>
      </div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Assessment Library</h1>
          <p className="text-gray-600 mt-1">Manage and access all your assessment templates</p>
        </div>
        
        <div className="w-full md:w-auto">
          {/* <div className="relative">
            <input
              type="text"
              placeholder="Search assessments..."
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div> */}
        </div>
      </div>

      {/* Subject Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {subjects.map((subject) => (
          <button
            key={subject}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === subject
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveFilter(subject)}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {activeFilter === "All" && !searchQuery
              ? "No assessments uploaded yet"
              : "No matching assessments found"}
          </h3>
          <p className="mt-1 text-gray-500">
            {activeFilter === "All" && !searchQuery
              ? "Upload your first assessment to get started"
              : "Try changing your filters or search query"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssessments.map((a) => (
             <div
             key={a._id}
             className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-hidden"
           >
             <div className="p-5">
               <h2 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                 {a.assessmentName}
               </h2>
               <p className="text-sm text-gray-600 mb-3 truncate">{a.subject}</p>
               <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                 Grade {a.gradeLevel}
               </span>
             </div>
             <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
               {/* Delete Button */}
               <button
                 onClick={() => handleDeleteAssessment(a._id)}
                 disabled={isDeleting}
                 className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                 title="Delete assessment"
               >
                 <svg
                   className="h-4 w-4"
                   fill="none"
                   viewBox="0 0 24 24"
                   stroke="currentColor"
                 >
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                   />
                 </svg>
                 Delete
               </button>
               {/* Download Button */}
               <a
                 href={a.signedUrl}
                 download
                 className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
               >
                 <svg
                   className="h-4 w-4"
                   fill="none"
                   viewBox="0 0 24 24"
                   stroke="currentColor"
                 >
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                   />
                 </svg>
                 Download
               </a>
             </div>
           </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentLibrary;
