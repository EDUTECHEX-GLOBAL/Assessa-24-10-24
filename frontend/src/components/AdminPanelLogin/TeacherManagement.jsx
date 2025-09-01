import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/admin/teachers");
        const data = await res.json();
        setTeachers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await fetch(`/api/admin/${id}`, {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ role: "teacher" }),
});

      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting teacher:", err);
    }
  };

  const handleGrantAccess = async (id) => {
    try {
      await fetch(`/api/admin/${id}/toggle`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ role: "teacher", action: "grant" }),
});

      setTeachers((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: "active" } : t))
      );
    } catch (err) {
      console.error("Error granting access:", err);
    }
  };

  if (loading) return <p>Loading teachers...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* ✅ Back to Dashboard */}
      <button
        onClick={() => navigate("/admin-dashboard")}
        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-4">Teacher Management</h2>
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
          {teachers.length > 0 ? (
            teachers.map((t) => (
              <tr key={t._id}>
                <td className="p-2 border">{t.name}</td>
                <td className="p-2 border">{t.email}</td>
                <td className="p-2 border">{t.status}</td>
                <td className="p-2 border space-x-2">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(t._id)}
                  >
                    Delete
                  </button>
                  {t.status !== "active" && (
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded"
                      onClick={() => handleGrantAccess(t._id)}
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
                No teachers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
