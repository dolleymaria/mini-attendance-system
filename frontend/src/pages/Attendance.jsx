import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import api from "../services/api";

const getTodayLocalDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatAttendanceDate = (dateValue) => {
  if (!dateValue) {
    return "--";
  }

  // PostgreSQL DATE
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split("-");

    return `${day}-${month}-${year}`;
  }

  // ISO timestamp
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const Attendance = () => {
  // ============================================
  // STATE
  // ============================================

  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  // Attendance summary
  const [summary, setSummary] = useState({
    totalRecords: 0,
    presentDays: 0,
    absentDays: 0,
    halfDays: 0,
    leaveDays: 0,
    attendancePercentage: "0.00%",
  });

  // Employee history modal
  const [showHistoryModal, setShowHistoryModal] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [employeeHistory, setEmployeeHistory] =
    useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [historyError, setHistoryError] =
    useState("");

  // Mark attendance modal
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    attendance_date: getTodayLocalDate(),
    check_in_time: "",
    check_out_time: "",
    attendance_status: "PRESENT",
  });

  // ============================================
  // FETCH EMPLOYEES
  // ============================================

  const fetchEmployees = async () => {
    try {
      const response = await api.get(
        "/employees?page=1&limit=100"
      );

      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error(
        "Failed to load employees:",
        error
      );
    }
  };

  // ============================================
  // FETCH ATTENDANCE
  // ============================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (date) {
        params.append("date", date);
      }

      if (employeeId) {
        params.append("employee_id", employeeId);
      }

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/attendance?${params.toString()}`
      );

      setAttendance(
        response.data.attendance || []
      );

      setPagination(
        response.data.pagination || {
          total: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error(
        "Attendance error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FETCH ATTENDANCE SUMMARY
  // ============================================

  const fetchAttendanceSummary = async () => {
    try {
      const params = new URLSearchParams();

      if (employeeId) {
        params.append(
          "employee_id",
          employeeId
        );
      }

      if (date) {
        params.append(
          "start_date",
          date
        );

        params.append(
          "end_date",
          date
        );
      }

      const queryString = params.toString();

      const response = await api.get(
        `/attendance/summary${
          queryString
            ? `?${queryString}`
            : ""
        }`
      );

      setSummary(
        response.data.summary || {
          totalRecords: 0,
          presentDays: 0,
          absentDays: 0,
          halfDays: 0,
          leaveDays: 0,
          attendancePercentage: "0.00%",
        }
      );
    } catch (error) {
      console.error(
        "Attendance summary error:",
        error
      );
    }
  };

  // ============================================
  // FETCH EMPLOYEE ATTENDANCE HISTORY
  // ============================================

  const openEmployeeHistory = async (
    employeeDatabaseId
  ) => {
    try {
      setHistoryLoading(true);
      setHistoryError("");
      setSelectedEmployee(null);
      setEmployeeHistory([]);
      setShowHistoryModal(true);

      const response = await api.get(
        `/attendance/employee/${employeeDatabaseId}`
      );

      setSelectedEmployee(
        response.data.employee
      );

      setEmployeeHistory(
        response.data.attendance || []
      );
    } catch (error) {
      console.error(
        "Employee attendance history error:",
        error
      );

      setHistoryError(
        error.response?.data?.message ||
          "Failed to load employee attendance history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // ============================================
  // CLOSE EMPLOYEE HISTORY MODAL
  // ============================================

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedEmployee(null);
    setEmployeeHistory([]);
    setHistoryError("");
  };

  // ============================================
  // USE EFFECTS
  // ============================================

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchAttendanceSummary();
  }, [
    page,
    date,
    employeeId,
    status,
  ]);

  // ============================================
  // FORM HANDLING
  // ============================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================
  // OPEN MARK ATTENDANCE MODAL
  // ============================================

  const openModal = () => {
    setFormData({
      employee_id: "",
      attendance_date:
        getTodayLocalDate(),
      check_in_time: "",
      check_out_time: "",
      attendance_status: "PRESENT",
    });

    setShowModal(true);
  };

  // ============================================
  // CLOSE MARK ATTENDANCE MODAL
  // ============================================

  const closeModal = () => {
    setShowModal(false);
  };

  // ============================================
  // MARK ATTENDANCE
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/attendance", {
        employee_id: Number(
          formData.employee_id
        ),

        attendance_date:
          formData.attendance_date,

        check_in_time:
          formData.check_in_time || null,

        check_out_time:
          formData.check_out_time || null,

        attendance_status:
          formData.attendance_status,
      });

      alert(
        "Attendance marked successfully."
      );

      closeModal();

      setPage(1);

      await fetchAttendance();
      await fetchAttendanceSummary();
    } catch (error) {
      console.error(
        "Mark attendance error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to mark attendance."
      );
    }
  };

  // ============================================
  // CLEAR FILTERS
  // ============================================

  const clearFilters = () => {
    setDate("");
    setEmployeeId("");
    setStatus("");
    setPage(1);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="employees-page">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="page-header">

        <div>
          <h1>Attendance</h1>

          <p>
            Manage employee attendance records
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openModal}
        >
          <Plus size={18} />
          Mark Attendance
        </button>

      </div>

      {/* ====================================== */}
      {/* ATTENDANCE SUMMARY */}
      {/* ====================================== */}

      <div className="attendance-summary">

        <div className="summary-card">
          <span>Total Records</span>
          <strong>
            {summary.totalRecords}
          </strong>
        </div>

        <div className="summary-card">
          <span>Present</span>
          <strong>
            {summary.presentDays}
          </strong>
        </div>

        <div className="summary-card">
          <span>Absent</span>
          <strong>
            {summary.absentDays}
          </strong>
        </div>

        <div className="summary-card">
          <span>Half Day</span>
          <strong>
            {summary.halfDays}
          </strong>
        </div>

        <div className="summary-card">
          <span>Leave</span>
          <strong>
            {summary.leaveDays}
          </strong>
        </div>

        <div className="summary-card">
          <span>Attendance %</span>
          <strong>
            {summary.attendancePercentage}
          </strong>
        </div>

      </div>

      {/* ====================================== */}
      {/* FILTERS */}
      {/* ====================================== */}

      <div className="filters-card">

        <div className="search-box">

          <Search size={18} />

          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
          />

        </div>

        <select
          value={employeeId}
          onChange={(e) => {
            setEmployeeId(
              e.target.value
            );

            setPage(1);
          }}
        >

          <option value="">
            All Employees
          </option>

          {employees.map(
            (employee) => (
              <option
                key={employee.id}
                value={employee.id}
              >
                {employee.employee_name}
              </option>
            )
          )}

        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >

          <option value="">
            All Status
          </option>

          <option value="PRESENT">
            Present
          </option>

          <option value="ABSENT">
            Absent
          </option>

          <option value="HALF_DAY">
            Half Day
          </option>

          <option value="LEAVE">
            Leave
          </option>

        </select>

        {(date ||
          employeeId ||
          status) && (

          <button
            className="clear-button"
            onClick={clearFilters}
          >
            Clear
          </button>

        )}

      </div>

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* ====================================== */}
      {/* ATTENDANCE TABLE */}
      {/* ====================================== */}

      <div className="table-card">

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="table-message"
                  >
                    Loading attendance...
                  </td>

                </tr>

              ) : attendance.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="table-message"
                  >
                    No attendance records found.
                  </td>

                </tr>

              ) : (

                attendance.map(
                  (record) => (

                    <tr key={record.id}>

                      {/* Employee ID */}

                      <td>
                        <strong>
                          {
                            record.employee_id
                          }
                        </strong>
                      </td>

                      {/* Employee Name */}

                      <td>

                        <button
                          type="button"
                          className="employee-name-button"
                          onClick={() =>
                            openEmployeeHistory(
                              record.employee_database_id
                            )
                          }
                        >
                          {
                            record.employee_name
                          }
                        </button>

                      </td>

                      {/* Department */}

                      <td>
                        {record.department}
                      </td>

                      {/* Date */}

                      <td>
                        {formatAttendanceDate(
                          record.attendance_date
                        )}
                      </td>

                      {/* Check In */}

                      <td>
                        {
                          record.check_in_time ||
                          "--"
                        }
                      </td>

                      {/* Check Out */}

                      <td>
                        {
                          record.check_out_time ||
                          "--"
                        }
                      </td>

                      {/* Status */}

                      <td>

                        <span
                          className={`status-badge ${
                            record.attendance_status ===
                            "PRESENT"
                              ? "active-status"
                              : "inactive-status"
                          }`}
                        >
                          {
                            record.attendance_status
                          }
                        </span>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {/* ==================================== */}
        {/* PAGINATION */}
        {/* ==================================== */}

        <div className="pagination">

          <span>
            Total:{" "}
            {pagination.total || 0}
          </span>

          <div className="pagination-controls">

            <button
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (previous) =>
                    previous - 1
                )
              }
            >
              <ChevronLeft size={18} />
            </button>

            <span>
              Page {page} of{" "}
              {pagination.totalPages ||
                1}
            </span>

            <button
              disabled={
                page >=
                (pagination.totalPages ||
                  1)
              }
              onClick={() =>
                setPage(
                  (previous) =>
                    previous + 1
                )
              }
            >
              <ChevronRight size={18} />
            </button>

          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* EMPLOYEE ATTENDANCE HISTORY MODAL */}
      {/* ====================================== */}

      {showHistoryModal && (

        <div className="modal-overlay">

          <div className="modal history-modal">

            {/* Modal Header */}

            <div className="modal-header">

              <div>

                <h2>
                  Employee Attendance History
                </h2>

                {selectedEmployee && (
                  <p>
                    {
                      selectedEmployee.employee_name
                    }{" "}
                    (
                    {
                      selectedEmployee.employee_id
                    }
                    )
                  </p>
                )}

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeHistoryModal
                }
              >
                <X size={20} />
              </button>

            </div>

            {/* Loading */}

            {historyLoading ? (

              <div className="table-message">
                Loading attendance history...
              </div>

            ) : historyError ? (

              <div className="dashboard-error">
                {historyError}
              </div>

            ) : selectedEmployee ? (

              <>

                {/* Employee Details */}

                <div className="employee-history-details">

                  <div>
                    <strong>
                      Employee ID
                    </strong>

                    <span>
                      {
                        selectedEmployee.employee_id
                      }
                    </span>
                  </div>

                  <div>
                    <strong>
                      Name
                    </strong>

                    <span>
                      {
                        selectedEmployee.employee_name
                      }
                    </span>
                  </div>

                  <div>
                    <strong>
                      Department
                    </strong>

                    <span>
                      {
                        selectedEmployee.department
                      }
                    </span>
                  </div>

                  <div>
                    <strong>
                      Designation
                    </strong>

                    <span>
                      {
                        selectedEmployee.designation
                      }
                    </span>
                  </div>

                </div>

                {/* Attendance History */}

                <div className="history-table-container">

                  <table>

                    <thead>

                      <tr>
                        <th>Date</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Status</th>
                      </tr>

                    </thead>

                    <tbody>

                      {employeeHistory.length ===
                      0 ? (

                        <tr>

                          <td
                            colSpan="4"
                            className="table-message"
                          >
                            No attendance
                            records found.
                          </td>

                        </tr>

                      ) : (

                        employeeHistory.map(
                          (record) => (

                            <tr
                              key={record.id}
                            >

                              <td>
                                {formatAttendanceDate(
                                  record.attendance_date
                                )}
                              </td>

                              <td>
                                {
                                  record.check_in_time ||
                                  "--"
                                }
                              </td>

                              <td>
                                {
                                  record.check_out_time ||
                                  "--"
                                }
                              </td>

                              <td>

                                <span
                                  className={`status-badge ${
                                    record.attendance_status ===
                                    "PRESENT"
                                      ? "active-status"
                                      : "inactive-status"
                                  }`}
                                >
                                  {
                                    record.attendance_status
                                  }
                                </span>

                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </>

            ) : null}

            {/* Modal Footer */}

            <div className="modal-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={
                  closeHistoryModal
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ====================================== */}
      {/* MARK ATTENDANCE MODAL */}
      {/* ====================================== */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            {/* Header */}

            <div className="modal-header">

              <div>

                <h2>
                  Mark Attendance
                </h2>

                <p>
                  Enter employee attendance
                  information
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                {/* Employee */}

                <div className="form-field">

                  <label>
                    Employee
                  </label>

                  <select
                    name="employee_id"
                    value={
                      formData.employee_id
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                  >

                    <option value="">
                      Select Employee
                    </option>

                    {employees.map(
                      (employee) => (

                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {
                            employee.employee_name
                          }{" "}
                          (
                          {
                            employee.employee_id
                          }
                          )
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* Date */}

                <div className="form-field">

                  <label>
                    Attendance Date
                  </label>

                  <input
                    type="date"
                    name="attendance_date"
                    value={
                      formData.attendance_date
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                  />

                </div>

                {/* Check In */}

                <div className="form-field">

                  <label>
                    Check-In Time
                  </label>

                  <input
                    type="time"
                    name="check_in_time"
                    value={
                      formData.check_in_time
                    }
                    onChange={
                      handleInputChange
                    }
                  />

                </div>

                {/* Check Out */}

                <div className="form-field">

                  <label>
                    Check-Out Time
                  </label>

                  <input
                    type="time"
                    name="check_out_time"
                    value={
                      formData.check_out_time
                    }
                    onChange={
                      handleInputChange
                    }
                  />

                </div>

                {/* Status */}

                <div className="form-field">

                  <label>
                    Attendance Status
                  </label>

                  <select
                    name="attendance_status"
                    value={
                      formData.attendance_status
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="PRESENT">
                      Present
                    </option>

                    <option value="ABSENT">
                      Absent
                    </option>

                    <option value="HALF_DAY">
                      Half Day
                    </option>

                    <option value="LEAVE">
                      Leave
                    </option>

                  </select>

                </div>

              </div>

              {/* Actions */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Mark Attendance
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Attendance;