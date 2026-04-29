import React, { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaChalkboardTeacher, FaUsers, FaArrowLeft } from "react-icons/fa";
import { listClasses, deleteClass } from "../../api/classes";
import { useNavigate } from "react-router-dom";
import "./AdminClassManagement.css";

const AdminClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await listClasses();
      setClasses(data || []);
    } catch (err) {
      alert("Không tải được danh sách lớp.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`Xoá lớp "${className}" sẽ xoá toàn bộ dữ liệu bài thi và điểm số. Tiếp tục?`)) {
      return;
    }
    setDeletingId(classId);
    try {
      await deleteClass({ classId });
      setClasses(prev => prev.filter(c => c.id !== classId));
      const toast = document.createElement('div');
      toast.className = 'toast-success';
      toast.textContent = 'Đã xóa lớp thành công!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch {
      alert("Không xóa được.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-classes">
      <div className="ac-header">
        <div className="ac-title">
          <FaChalkboardTeacher className="ac-icon" />
          <h2>Quản lý lớp học</h2>
        </div>
      </div>

      <div className="ac-controls">
        <div className="ac-search">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm lớp học, giáo viên, mã lớp..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="ac-table-wrap">
        {loading ? (
          <div className="ac-loading"><div className="spinner" /></div>
        ) : (
          <table className="ac-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên lớp</th>
                <th>Mã lớp</th>
                <th>Giáo viên</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><strong>{c.name}</strong></td>
                  <td><span className="code-badge">{c.code}</span></td>
                  <td>{c.teacher_full_name}</td>
                  <td>{new Date(c.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <div className="ac-actions">
                      <button className="ac-btn-view" onClick={() => navigate(`/classes/${c.id}`)}>
                        Chi tiết
                      </button>
                      <button 
                        className="ac-btn-del" 
                        onClick={() => handleDeleteClass(c.id, c.name)}
                        disabled={deletingId === c.id}
                      >
                        {deletingId === c.id ? <div className="mini-spinner" /> : <FaTrash />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    Không tìm thấy lớp học.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminClassManagement;
