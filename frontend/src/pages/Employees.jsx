import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import api from "../services/api";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    email: "",
    mobile_number: "",
    department: "",
    designation: "",
    status: "ACTIVE",
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (department) {
        params.append("department", department);
      }

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/employees?${params.toString()}`
      );

      setEmployees(response.data.employees || []);
      
      setPagination(
        response.data.pagination || {
          total: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load employees."
      );
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchEmployees();
}, [page, search, department, status]);

useEffect(() => {
  fetchDepartments();
}, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const fetchDepartments = async () => {
  try {
    const response = await api.get(
      "/employees/departments"
    );

    setDepartments(
      response.data.departments || []
    );
  } catch (error) {
    console.error(
      "Failed to load departments:",
      error
    );
  }
};

  const openAddModal = () => {
    setEditingEmployee(null);

    setFormData({
      employee_id: "",
      employee_name: "",
      email: "",
      mobile_number: "",
      department: "",
      designation: "",
      status: "ACTIVE",
    });

    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setFormData({
      employee_id: employee.employee_id || "",
      employee_name: employee.employee_name || "",
      email: employee.email || "",
      mobile_number: employee.mobile_number || "",
      department: employee.department || "",
      designation: employee.designation || "",
      status: employee.status || "ACTIVE",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingEmployee) {
        await api.put(
          `/employees/${editingEmployee.id}`,
          formData
        );
      } else {
        await api.post("/employees", formData);
      }

      closeModal();
      await fetchEmployees();
      await fetchDepartments();

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to save employee."
      );
    }
  };

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.employee_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/employees/${employee.id}`
      );

      fetchEmployees();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete employee."
      );
    }
  };

  const handleView = async (employee) => {
    try {
      const response = await api.get(
        `/employees/${employee.id}`
      );

      setSelectedEmployee(response.data.employee);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load employee details."
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDepartment("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="employees-page">

      {/* Header */}
      <div className="page-header">

        <div>
          <h1>Employees</h1>
          <p>
            Manage employee information and records
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Employee
        </button>

      </div>

      {/* Filters */}
      <div className="filters-card">

        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
  value={department}
  onChange={(e) => {
    setDepartment(e.target.value);
    setPage(1);
  }}
>
  <option value="">
    All Departments
  </option>

  {departments.map((dept) => (
    <option
      key={dept}
      value={dept}
    >
      {dept}
    </option>
  ))}
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

          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>
        </select>

        {(search || department || status) && (
          <button
            className="clear-button"
            onClick={clearFilters}
          >
            Clear
          </button>
        )}

      </div>

      {/* Error */}
      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="table-card">

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="table-message"
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="table-message"
                  >
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>

                    <td>
                      <strong>
                        {employee.employee_id}
                      </strong>
                    </td>

                    <td>
                      {employee.employee_name}
                    </td>

                    <td>
                      {employee.email}
                    </td>

                    <td>
                      {employee.department}
                    </td>

                    <td>
                      {employee.designation}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          employee.status ===
                          "ACTIVE"
                            ? "active-status"
                            : "inactive-status"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          className="icon-button view"
                          title="View"
                          onClick={() =>
                            handleView(employee)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          className="icon-button edit"
                          title="Edit"
                          onClick={() =>
                            openEditModal(employee)
                          }
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          className="icon-button delete"
                          title="Delete"
                          onClick={() =>
                            handleDelete(employee)
                          }
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}
        <div className="pagination">

          <span>
            Total: {pagination.total || 0}
          </span>

          <div className="pagination-controls">

            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((previous) =>
                  previous - 1
                )
              }
            >
              <ChevronLeft size={18} />
            </button>

            <span>
              Page {page} of{" "}
              {pagination.totalPages || 1}
            </span>

            <button
              disabled={
                page >=
                (pagination.totalPages || 1)
              }
              onClick={() =>
                setPage((previous) =>
                  previous + 1
                )
              }
            >
              <ChevronRight size={18} />
            </button>

          </div>

        </div>

      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p>
                  {editingEmployee
                    ? "Update employee information"
                    : "Enter employee information"}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-field">
                  <label>Employee ID</label>

                  <input
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Employee Name</label>

                  <input
                    name="employee_name"
                    value={formData.employee_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Email Address</label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Mobile Number</label>

                  <input
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-field">
                  <label>Department</label>

                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Designation</label>

                  <input
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>

              </div>

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
                  {editingEmployee
                    ? "Update Employee"
                    : "Create Employee"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="modal-overlay">

          <div className="modal details-modal">

            <div className="modal-header">

              <div>
                <h2>Employee Details</h2>
                <p>
                  Complete employee information
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedEmployee(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="details-grid">

              <div>
                <span>Employee ID</span>
                <strong>
                  {selectedEmployee.employee_id}
                </strong>
              </div>

              <div>
                <span>Name</span>
                <strong>
                  {selectedEmployee.employee_name}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedEmployee.email}
                </strong>
              </div>

              <div>
                <span>Mobile</span>
                <strong>
                  {selectedEmployee.mobile_number ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Department</span>
                <strong>
                  {selectedEmployee.department}
                </strong>
              </div>

              <div>
                <span>Designation</span>
                <strong>
                  {selectedEmployee.designation}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedEmployee.status}
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Employees;