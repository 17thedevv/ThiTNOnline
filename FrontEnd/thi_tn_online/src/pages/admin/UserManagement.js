import { useState, useEffect, useCallback } from "react";
import {
  FaUsers, FaSearch, FaEdit, FaTrash, FaUserShield,
  FaUserGraduate, FaChalkboardTeacher, FaTimes, FaSave,
  FaExclamationTriangle, FaPlus
} from "react-icons/fa";
import { getUsers, updateUser, deleteUser, createUser } from "../../api/admin";
import "./UserManagement.css";

const ROLE_CONFIG = {
  student: { label: "Sinh viên", icon: FaUserGraduate, color: "blue" },
  teacher: { label: "Giảng viên", icon: FaChalkboardTeacher, color: "purple" },
  admin:   { label: "Quản trị viên", icon: FaUserShield, color: "red" },
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || { label: role, color: "gray" };
  return <span className={`um-badge um-badge--${cfg.color}`}>{cfg.label}</span>;
};

const CreateModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "student",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createUser(form);
      onSave(created);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.username?.[0] || "Đã xảy ra lỗi khi tạo người dùng.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <div className="um-modal-header">
          <div className="um-modal-title">
            <FaPlus />
            <span>Thêm / Đăng ký người dùng mới</span>
          </div>
          <button className="um-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <form className="um-modal-form" onSubmit={handleSubmit}>
          {error && <div className="um-error">{error}</div>}

          <div className="um-form-row">
            <div className="um-form-group">
              <label>Tên đăng nhập *</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Ví dụ: student_123"
                required
              />
            </div>
            <div className="um-form-group">
              <label>Mật khẩu *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="********"
                required
              />
            </div>
          </div>

          <div className="um-form-row">
            <div className="um-form-group">
              <label>Họ</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Nhập họ..."
              />
            </div>
            <div className="um-form-group">
              <label>Tên</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Nhập tên..."
              />
            </div>
          </div>

          <div className="um-form-row">
            <div className="um-form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Nhập email..."
                required
              />
            </div>
            <div className="um-form-group">
              <label>Vai trò</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="student">Sinh viên</option>
                <option value="teacher">Giảng viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          <div className="um-modal-actions">
            <button type="button" className="um-btn um-btn--ghost" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="um-btn um-btn--primary" disabled={saving}>
              <FaSave />
              {saving ? "Đang tạo..." : "Tạo người dùng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    role: user.role || "student",
    is_active: user.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateUser(user.id, form);
      onSave(updated);
    } catch (err) {
      setError(err.response?.data?.detail || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <div className="um-modal-header">
          <div className="um-modal-title">
            <FaEdit />
            <span>Chỉnh sửa người dùng</span>
          </div>
          <button className="um-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <form className="um-modal-form" onSubmit={handleSubmit}>
          <div className="um-modal-username">
            <strong>@{user.username}</strong>
          </div>

          {error && <div className="um-error">{error}</div>}

          <div className="um-form-row">
            <div className="um-form-group">
              <label>Họ</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Nhập họ..."
              />
            </div>
            <div className="um-form-group">
              <label>Tên</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Nhập tên..."
              />
            </div>
          </div>

          <div className="um-form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Nhập email..."
            />
          </div>

          <div className="um-form-row">
            <div className="um-form-group">
              <label>Vai trò</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="student">Sinh viên</option>
                <option value="teacher">Giảng viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div className="um-form-group">
              <label>Trạng thái</label>
              <select
                value={form.is_active ? "active" : "inactive"}
                onChange={(e) => setForm({ ...form, is_active: e.target.value === "active" })}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Bị khóa</option>
              </select>
            </div>
          </div>

          <div className="um-modal-actions">
            <button type="button" className="um-btn um-btn--ghost" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="um-btn um-btn--primary" disabled={saving}>
              <FaSave />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirm = ({ user, onClose, onConfirm }) => (
  <div className="um-modal-overlay" onClick={onClose}>
    <div className="um-modal um-modal--sm" onClick={(e) => e.stopPropagation()}>
      <div className="um-modal-header">
        <div className="um-modal-title um-modal-title--danger">
          <FaExclamationTriangle />
          <span>Xác nhận xóa</span>
        </div>
        <button className="um-modal-close" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="um-delete-body">
        <p>
          Bạn có chắc muốn xóa tài khoản <strong>@{user.username}</strong>?
          <br />
          <span className="um-warning-text">Hành động này không thể hoàn tác.</span>
        </p>
        <div className="um-modal-actions">
          <button className="um-btn um-btn--ghost" onClick={onClose}>Hủy</button>
          <button className="um-btn um-btn--danger" onClick={onConfirm}>
            <FaTrash /> Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  </div>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const data = await getUsers(params);
      setUsers(data);
    } catch (err) {
      showToast("Không thể tải danh sách người dùng.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSaveEdit = (updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setEditUser(null);
    showToast("Cập nhật thành công!");
  };

  const handleCreate = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    setShowCreate(false);
    showToast("Tạo người dùng thành công!");
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Đã xóa người dùng.");
    } catch (err) {
      showToast(err.response?.data?.error || "Xóa thất bại.", "error");
    }
  };

  return (
    <div className="user-mgmt">
      {/* HEADER */}
      <div className="um-header">
        <div className="um-header-title">
          <div className="um-header-icon"><FaUsers /></div>
          <div>
            <h1>Quản lý người dùng</h1>
            <p>{users.length} tài khoản</p>
          </div>
        </div>
        <button className="um-btn-add" onClick={() => setShowCreate(true)}>
          <FaPlus /> Thêm người dùng
        </button>
      </div>

      {/* FILTERS */}
      <div className="um-filters">
        <div className="um-search-wrap">
          <FaSearch className="um-search-icon" />
          <input
            className="um-search"
            type="text"
            placeholder="Tìm theo tên, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="um-role-tabs">
          {[
            { value: "", label: "Tất cả" },
            { value: "student", label: "Sinh viên" },
            { value: "teacher", label: "Giảng viên" },
            { value: "admin", label: "Quản trị viên" },
          ].map((tab) => (
            <button
              key={tab.value}
              className={`um-role-tab ${roleFilter === tab.value ? "active" : ""}`}
              onClick={() => setRoleFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="um-table-wrap">
        {loading ? (
          <div className="um-loading">
            <div className="um-spinner" />
            <span>Đang tải...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="um-empty">
            <FaUsers />
            <span>Không có người dùng nào.</span>
          </div>
        ) : (
          <table className="um-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={!u.is_active ? "um-row--inactive" : ""}>
                  <td className="um-td-id">#{u.id}</td>
                  <td>
                    <div className="um-user-cell">
                      <div className="um-avatar">
                        {u.avatar
                          ? <img src={u.avatar} alt={u.username} />
                          : <span>{(u.full_name || u.username)[0].toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <div className="um-username">@{u.username}</div>
                        <div className="um-fullname">{u.full_name || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="um-td-email">{u.email || "—"}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>
                    <span className={`um-status um-status--${u.is_active ? "active" : "inactive"}`}>
                      {u.is_active ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="um-td-date">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td>
                    <div className="um-actions">
                      <button
                        className="um-action-btn um-action-btn--edit"
                        onClick={() => setEditUser(u)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="um-action-btn um-action-btn--delete"
                        onClick={() => setDeleteTarget(u)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALS */}
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editUser && (
        <EditModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSaveEdit} />
      )}
      {deleteTarget && (
        <DeleteConfirm
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className={`um-toast um-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
};

export default UserManagement;
