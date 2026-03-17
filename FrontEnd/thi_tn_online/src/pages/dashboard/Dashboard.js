import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { listClasses } from "../../api/classes";
import { listSubmissions } from "../../api/submissions";
import { listExams } from "../../api/exams";
import { 
  FaGraduationCap, 
  FaBook, 
  FaChartLine, 
  FaClock, 
  FaTrophy, 
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaPlay,
  FaEye,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaClipboardList,
  FaStar,
  FaMedal,
  FaChartPie,
  FaPlus,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import "./Dashboard.css";

// Action handlers for navigation
const handleEditExam = (examId, examTitle, navigate) => {
  console.log(`Chỉnh sửa bài thi ID: ${examId}`);
  // Navigate to edit exam page
  navigate(`/exams/${examId}/edit`);
};

const handleViewExam = (examId, examTitle, navigate) => {
  console.log(`Xem chi tiết bài thi ID: ${examId}`);
  // Navigate to exam details page
  navigate(`/exams/${examId}`);
};

const handleStartExam = (examId, examTitle, duration, questionCount, navigate) => {
  console.log(`Bắt đầu làm bài thi ID: ${examId}`);
  // Navigate to take exam page
  navigate(`/exams/${examId}/take`);
};

const handleViewSubmissions = (examId, examTitle, navigate) => {
  console.log(`Xem bài nộp của bài thi ID: ${examId}`);
  // Navigate to submissions page
  navigate(`/exams/${examId}/submissions`);
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Helper function to get full name
  const getUserFullName = () => {
    if (!user) return 'Không xác định';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.username || 'Không xác định';
  };

  // Action handlers for navigation
  const handleEditExam = (examId, examTitle) => {
    console.log(`Chỉnh sửa bài thi ID: ${examId}`);
    // Navigate to exam detail page
    navigate(`/exam/${examId}`);
  };

  const handleViewExam = (examId, examTitle) => {
    console.log(`Xem chi tiết bài thi ID: ${examId}`);
    // Navigate to exam details page
    navigate(`/exam/${examId}`);
  };

  const handleStartExam = (examId, examTitle, duration, questionCount) => {
    console.log(`Bắt đầu làm bài thi ID: ${examId}`);
    // Navigate to exam detail page
    navigate(`/exam/${examId}`);
  };

  const handleViewSubmissions = (examId, examTitle) => {
    console.log(`Xem bài nộp của bài thi ID: ${examId}`);
    // Navigate to exam detail page
    navigate(`/exam/${examId}`);
  };

  const role = user?.role;
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const isStudent = user?.role === "student";

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [clsRes, subsRes, exsRes] = await Promise.allSettled([
        listClasses(),
        listSubmissions(),
        listExams(),
      ]);

      if (!mounted) return;

      if (clsRes.status === "fulfilled") {
        setClasses(clsRes.value || []);
      } else {
        console.error("Không tải được danh sách lớp:", clsRes.reason);
      }

      if (subsRes.status === "fulfilled") {
        setSubmissions(subsRes.value || []);
      } else {
        console.error("Không tải được danh sách bài nộp:", subsRes.reason);
      }

      if (exsRes.status === "fulfilled") {
        setExams(exsRes.value || []);
      } else {
        console.error("Không tải được danh sách đề thi:", exsRes.reason);
      }

      if (
        clsRes.status === "rejected" &&
        subsRes.status === "rejected" &&
        exsRes.status === "rejected"
      ) {
        setError("Không tải được dữ liệu tổng quan. Vui lòng thử lại sau.");
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const teacherStats = useMemo(() => {
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students_count || cls.students?.length || 0), 0);
    const totalExams = exams.length;
    const totalSubmissions = submissions.length;
    const avgScore = submissions.length
      ? submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length
      : 0;
    const passedSubmissions = submissions.filter(sub => sub.is_passed).length;

    return {
      totalClasses: classes.length,
      totalStudents,
      totalExams,
      totalSubmissions,
      passedSubmissions,
      avgScore: avgScore.toFixed(1),
    };
  }, [classes, exams, submissions]);

  const studentStats = useMemo(() => {
    const myClasses = classes.filter(cls => 
      cls.students?.some(student => student.id === user?.id)
    );
    const mySubmissions = submissions.filter(sub => sub.student === user?.id);
    const passedExams = mySubmissions.filter(
      (sub) => sub.is_passed
    ).length;
    const avgScore = mySubmissions.length
      ? mySubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / mySubmissions.length
      : 0;

    return {
      totalClasses: myClasses.length,
      totalExams: myClasses.reduce((sum, cls) => sum + (cls.exams_count || 0), 0),
      completedExams: mySubmissions.length,
      passedExams,
      avgScore: avgScore.toFixed(1),
    };
  }, [classes, submissions, user?.id]);

  const recentExams = useMemo(() => {
    if (isTeacher) {
      return exams.slice(0, 5);
    } else {
      const myClasses = classes.filter(cls => cls.students?.some(student => student.id === user?.id));
      const myClassIds = myClasses.map(cls => cls.id);
      return exams.filter(exam => myClassIds.includes(exam.exam_class)).slice(0, 5);
    }
  }, [exams, classes, user?.id, isTeacher]);

  const recentSubmissions = useMemo(() => {
    if (isTeacher) {
      return submissions
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
        .slice(0, 5);
    } else {
      return submissions
        .filter(sub => sub.student === user?.id)
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
        .slice(0, 5);
    }
  }, [submissions, user?.id, isTeacher]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <FaGraduationCap className="spinner-icon" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <FaTimesCircle className="error-icon" />
          <h3>Đã có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            Chào mừng trở lại, {getUserFullName()}!
          </h1>
          <p className="dashboard-subtitle">
            {isTeacher 
              ? "Đây là tổng quan giảng dạy của bạn hôm nay" 
              : "Đây là tổng quan học tập của bạn hôm nay"
            }
          </p>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {isTeacher ? <FaChalkboardTeacher /> : <FaUserGraduate />}
          </div>
          <div className="user-details">
            <span className="user-name">{getUserFullName()}</span>
            <span className="user-role">
              {isTeacher ? "Giáo viên" : "Học sinh"}
            </span>
          </div>
        </div>
      </div>

      {/* Teacher Dashboard */}
      {isTeacher && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary teacher-card">
              <div className="stat-icon">
                <FaChalkboardTeacher />
              </div>
              <div className="stat-content">
                <h3>{teacherStats.totalClasses}</h3>
                <p>Lớp học đang giảng</p>
              </div>
              <div className="stat-trend up">
                <FaChartLine />
              </div>
            </div>

            <div className="stat-card success teacher-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>{teacherStats.totalStudents}</h3>
                <p>Tổng học sinh</p>
              </div>
              <div className="stat-trend up">
                <FaChartLine />
              </div>
            </div>

            <div className="stat-card warning teacher-card">
              <div className="stat-icon">
                <FaBook />
              </div>
              <div className="stat-content">
                <h3>{teacherStats.totalExams}</h3>
                <p>Bài thi đã tạo</p>
              </div>
              <div className="stat-trend neutral">
                <FaChartLine />
              </div>
            </div>

            <div className="stat-card info teacher-card">
              <div className="stat-icon">
                <FaClipboardList />
              </div>
              <div className="stat-content">
                <h3>{teacherStats.passedSubmissions}</h3>
                <p>Bài thi đạt</p>
                <small>trên {teacherStats.totalSubmissions} bài</small>
              </div>
              <div className="stat-trend up">
                <FaChartLine />
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FaCalendarAlt />
                  Bài thi gần đây
                </h2>
              </div>
              
              <div className="exam-list">
                {recentExams.length > 0 ? (
                  recentExams.map((exam) => (
                    <div key={exam.id} className="exam-card">
                      <div className="exam-info">
                        <h4 className="exam-title">{exam.title}</h4>
                        <div className="exam-meta">
                          <span className="exam-duration">
                            <FaClock /> {exam.duration} phút
                          </span>
                          <span className="exam-questions">
                            <FaBook /> {exam.question_count || 0} câu
                          </span>
                          <span className="exam-class">
                            <FaChalkboardTeacher /> {exam.class_name || exam.exam_class?.name || 'Chưa phân lớp'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FaBook className="empty-icon" />
                    <p>Chưa có bài thi nào</p>
                  </div>
                )}
              </div>
            </div>

            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FaClipboardList />
                  Bài thi gần đây được nộp
                </h2>
              </div>
              
              <div className="submission-list">
                {recentSubmissions.length > 0 ? (
                  recentSubmissions.map((submission) => (
                    <div key={submission.id} className="submission-card">
                      <div className="submission-info">
                        <h4 className="submission-title">{submission.exam?.title}</h4>
                        <p className="submission-student">
                          Học sinh: {submission.user_name || 'Unknown'}
                        </p>
                        <p className="submission-date">
                          {new Date(submission.submitted_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="submission-score">
                        <div className="score-circle">
                          <span className="score-value">{submission.score || 0}</span>
                        </div>
                        <div className="score-status">
                          {submission.score >= (submission.exam?.passing_score || 5) ? (
                            <span className="status passed">
                              <FaCheckCircle /> Đạt
                            </span>
                          ) : (
                            <span className="status failed">
                              <FaTimesCircle /> Không đạt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FaClipboardList className="empty-icon" />
                    <p>Chưa có bài nộp nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Student Dashboard */}
      {isStudent && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FaUserGraduate />
              </div>
              <div className="stat-content">
                <h3>{studentStats.totalClasses}</h3>
                <p>Lớp học</p>
              </div>
              <div className="stat-trend up">
                <FaChartLine />
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <FaTrophy />
              </div>
              <div className="stat-content">
                <h3>{studentStats.passedExams}</h3>
                <p>Bài thi đã qua</p>
              </div>
              <div className="stat-trend up">
                <FaChartLine />
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3>{studentStats.completedExams}</h3>
                <p>Bài thi đã làm</p>
              </div>
              <div className="stat-trend neutral">
                <FaChartLine />
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">
                <FaChartPie />
              </div>
              <div className="stat-content">
                <h3>{studentStats.avgScore}</h3>
                <p>Điểm trung bình</p>
              </div>
              <div className="stat-trend up">
                <FaChartLine />
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FaCalendarAlt />
                  Bài thi cần làm
                </h2>
              </div>
              
              <div className="exam-list">
                {recentExams.length > 0 ? (
                  recentExams.map((exam) => (
                    <div key={exam.id} className="exam-card">
                      <div className="exam-info">
                        <h4 className="exam-title">{exam.title}</h4>
                        <div className="exam-meta">
                          <span className="exam-duration">
                            <FaClock /> {exam.duration} phút
                          </span>
                          <span className="exam-questions">
                            <FaBook /> {exam.question_count || 0} câu
                          </span>
                          <span className="exam-class">
                            <FaChalkboardTeacher /> {exam.class_name || exam.exam_class?.name}
                          </span>
                        </div>
                      </div>
                      <div className="exam-actions">
                        <button 
                          className="btn-primary action-btn student-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartExam(exam.id, exam.title, exam.duration, exam.question_count, navigate);
                          }}
                        >
                          <FaPlay /> Bắt đầu làm bài
                        </button>
                        <button 
                          className="btn-secondary action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewExam(exam.id, exam.title, navigate);
                          }}
                        >
                          <FaEye /> Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FaBook className="empty-icon" />
                    <p>Không có bài thi nào cần làm</p>
                  </div>
                )}
              </div>
            </div>

            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FaTrophy />
                  Kết quả thi gần đây
                </h2>
              </div>
              
              <div className="submission-list">
                {recentSubmissions.length > 0 ? (
                  recentSubmissions.map((submission) => (
                    <div key={submission.id} className="submission-card">
                      <div className="submission-info">
                        <h4 className="submission-title">{submission.exam?.title}</h4>
                        <p className="submission-date">
                          {new Date(submission.submitted_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="submission-score">
                        <div className="score-circle">
                          <span className="score-value">{submission.score || 0}</span>
                        </div>
                        <div className="score-status">
                          {submission.score >= (submission.exam?.passing_score || 5) ? (
                            <span className="status passed">
                              <FaCheckCircle /> Đạt
                            </span>
                          ) : (
                            <span className="status failed">
                              <FaTimesCircle /> Không đạt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FaTrophy className="empty-icon" />
                    <p>Chưa có kết quả thi nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
