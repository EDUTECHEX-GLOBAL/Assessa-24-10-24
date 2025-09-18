// src/components/AdminPanelLogin/AdminSatAttempts.jsx
import React, { useEffect, useState } from "react";
import { Table, Spin, Alert, Button } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminSatAttempts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/attempts/sat", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        setError("Failed to fetch SAT attempts");
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const columns = [
    { title: "Student Name", dataIndex: "studentName", key: "studentName" },
    { title: "Email", dataIndex: "studentEmail", key: "studentEmail" },
    { title: "Class", dataIndex: "studentClass", key: "studentClass" },
    { title: "SAT Title", dataIndex: "assessmentTitle", key: "assessmentTitle" },
    { title: "Section", dataIndex: "sectionType", key: "sectionType" },
    { title: "Difficulty", dataIndex: "difficulty", key: "difficulty" },
    { title: "Score", dataIndex: "score", key: "score" },
    { title: "Total Marks", dataIndex: "totalMarks", key: "totalMarks" },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: (val) => `${val?.toFixed(2)}%`,
    },
    { title: "Time Taken (sec)", dataIndex: "timeTaken", key: "timeTaken" },
    {
      title: "Submitted At",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (val) => new Date(val).toLocaleString(),
    },
  ];

  if (loading) return <Spin fullscreen tip="Loading SAT Attempts..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>📝 SAT Assessment Attempts</h2>
        <Button type="primary" onClick={() => navigate("/admin-dashboard")}>
          ⬅ Back to Dashboard
        </Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="submissionId" />
    </div>
  );
};

export default AdminSatAttempts;
