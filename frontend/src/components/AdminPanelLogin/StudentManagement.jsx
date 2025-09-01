import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await fetch(`/api/admin/${id}`, {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ role: "student" }),
});

      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  const handleGrantAccess = async (id) => {
    try {
      await fetch(`/api/admin/${id}/toggle`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ role: "student", action: "grant" }),
});

      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: "active" } : s))
      );
    } catch (err) {
      console.error("Error granting access:", err);
    }
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* ✅ Back to Dashboard */}
      <button
        onClick={() => navigate("/admin-dashboard")}
        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-4">Student Management</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={s._id}>
                <td className="p-2 border">{s.name}</td>
                <td className="p-2 border">{s.email}</td>
                <td className="p-2 border">{s.status}</td>
                <td className="p-2 border space-x-2">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(s._id)}
                  >
                    Delete
                  </button>
                  {s.status !== "active" && (
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded"
                      onClick={() => handleGrantAccess(s._id)}
                    >
                      Grant Access
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
