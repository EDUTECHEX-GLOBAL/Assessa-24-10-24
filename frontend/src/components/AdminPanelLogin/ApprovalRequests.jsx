import { useState, useEffect } from "react";
import { FaUserCheck, FaUserTimes, FaEnvelope, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

function ApprovalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/admin/approvals?status=${filter}`);
        const data = await response.json();
        if (response.ok) {
          setRequests(data);
        } else {
          toast.error(data.message || "Failed to fetch requests");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Failed to fetch requests");
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filter]);

 // ONLY CHANGES SHOWN — Keep the rest of your component structure the same

// UPDATED handleApprove with role
const handleApprove = async (requestId, role) => {
  try {
    const response = await fetch(`/api/admin/approvals/${requestId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }), // ✅ Send role here
    });

    const data = await response.json();
    if (response.ok) {
      toast.success("Request approved successfully");
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } else {
      toast.error(data.message || "Failed to approve request");
    }
  } catch (error) {
    console.error("Error approving request:", error);
    toast.error("Failed to approve request");
  }
};

// UPDATED handleReject with full request passed in
const handleReject = (request) => {
  setCurrentRequest(request);
  setShowRejectionModal(true);
};

// UPDATED confirmRejection to send role
const confirmRejection = async () => {
  try {
    const response = await fetch(
      `/api/admin/approvals/${currentRequest._id}/reject`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: rejectionReason,
          role: currentRequest.role, // ✅ Send role here too
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      toast.success("Request rejected successfully");
      setRequests((prev) =>
        prev.filter((req) => req._id !== currentRequest._id)
      );
      setShowRejectionModal(false);
      setRejectionReason("");
    } else {
      toast.error(data.message || "Failed to reject request");
    }
  } catch (error) {
    console.error("Error rejecting request:", error);
    toast.error("Failed to reject request");
  }
};


  const filteredRequests = filter === "all"
    ? requests
    : requests.filter((req) => req.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold">User Approval Requests</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                filter === status
                  ? {
                      pending: "bg-blue-100 text-blue-800",
                      approved: "bg-green-100 text-green-800",
                      rejected: "bg-red-100 text-red-800",
                      all: "bg-purple-100 text-purple-800",
                    }[status]
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaClock className="text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No {filter} requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FaEnvelope className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Role</p>
                      <p className="text-sm font-medium capitalize">{request.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Requested On</p>
                      <p className="text-sm font-medium">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {request.status !== "pending" && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">
                          {request.status === "approved" ? "Approved" : "Rejected"} On
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(request.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {request.status === "rejected" && request.rejectionReason && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Rejection Reason</p>
                        <p className="text-sm font-medium">{request.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
                {request.status === "pending" && (
                  <div className="flex md:flex-col gap-2">
                    <button
  onClick={() => handleApprove(request._id, request.role)} // ✅ send role
  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
>
  <FaUserCheck />
  <span>Approve</span>
</button>

<button
  onClick={() => handleReject(request)} // ✅ we already pass full request
  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm"
>
  <FaUserTimes />
  <span>Reject</span>
</button>

                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reject Request</h3>
            <p className="mb-2">
              Rejecting request for {currentRequest?.name} ({currentRequest?.email})
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter reason for rejection..."
              required
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalRequests;
