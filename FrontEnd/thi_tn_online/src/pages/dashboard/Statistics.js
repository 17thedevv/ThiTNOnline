import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, message, Divider, Space, Select, Table, Skeleton } from 'antd';
import { UserOutlined, BookOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient as api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const Statistics = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    const [generalStats, setGeneralStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // Bộ lọc 3 cấp: Lớp → Môn → Bài thi
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);

    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);

    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState(null);

    // Data bài thi cụ thể
    const [examStats, setExamStats] = useState(null);
    const [examLoading, setExamLoading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const statsResponse = await api.get('/api/exams/statistics/general/');
                setGeneralStats(statsResponse.data);

                const classesResponse = await api.get('/api/classes/');
                setClasses(classesResponse.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu khởi tạo:", error);
                message.error("Có lỗi xảy ra khi tải dữ liệu ban đầu hoặc bạn không có quyền!");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleClassChange = async (classId) => {
        setSelectedClassId(classId);
        setSelectedSubjectId(null);
        setSelectedExamId(null);
        setExamStats(null);
        setSubjects([]);
        setExams([]);

        try {
            const response = await api.get(`/api/subjects/?class_id=${classId}`);
            setSubjects(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách môn học:", error);
            message.error("Không thể lấy danh sách môn học của lớp này.");
        }
    };

    const handleSubjectChange = async (subjectId) => {
        setSelectedSubjectId(subjectId);
        setSelectedExamId(null);
        setExamStats(null);
        setExams([]);

        try {
            const response = await api.get(`/api/exams/?subject_id=${subjectId}`);
            setExams(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách bài thi:", error);
            message.error("Không thể lấy danh sách bài thi của môn học này.");
        }
    };

    const handleExamChange = async (examId) => {
        setSelectedExamId(examId);
        if (!examId) return;

        setExamLoading(true);
        try {
            const response = await api.get(`/api/exams/statistics/${examId}/`);
            setExamStats(response.data);
            message.success("Tải dữ liệu bài thi thành công");
        } catch (error) {
            console.error("Lỗi truy xuất dữ liệu bài thi:", error);
            message.error("Không thể lấy dữ liệu thống kê cho bài thi này.");
            setExamStats(null);
        } finally {
            setExamLoading(false);
        }
    };

    const studentTableColumns = [
        {
            title: 'Học sinh',
            dataIndex: 'name',
            key: 'name',
            width: '35%',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '20%',
            render: (text) => (
                <span style={{ color: text === 'Đã nộp' ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
                    {text}
                </span>
            )
        },
        {
            title: 'Điểm số',
            dataIndex: 'score',
            key: 'score',
            width: '20%',
            render: (text) => text !== null ? text : '-'
        },
        {
            title: 'Thời gian nộp',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            render: (text) => text ? new Date(text).toLocaleString() : '-'
        }
    ];

    if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
            <Title level={2}>{isStudent ? "Tổng Quan Thành Tích Cá Nhân" : (generalStats?.admin_view ? "Thống Kê Khái Quát (Hệ Thống)" : "Thống Kê Khái Quát (Lớp Của Tôi)")}</Title>

            {generalStats ? (
                <Row gutter={[16, 16]}>
                    {generalStats.student_view && (
                        <>
                            <Col xs={24} sm={12} md={8}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Tổng Số Đề Thi (Từ lớp tham gia)" value={generalStats.total_exams_in_class} prefix={<BookOutlined style={{color: '#52c41a'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Số Lượt Đã Nộp Của Bạn" value={generalStats.total_submissions} prefix={<FileTextOutlined style={{color: '#722ed1'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Điểm TB Hiện Tại" value={generalStats.average_score} precision={2} prefix={<CheckCircleOutlined style={{color: '#eb2f96'}}/>} />
                                </Card>
                            </Col>
                        </>
                    )}

                    {generalStats.teacher_view && (
                        <>
                            <Col xs={24} sm={12} md={8}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Tổng Số Lớp Của Tôi" value={generalStats.total_classes} prefix={<BookOutlined style={{color: '#faad14'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Tổng Số Học Sinh Đang Dạy" value={generalStats.total_students} prefix={<UserOutlined style={{color: '#1890ff'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Số Đề Thi Đã Tạo Trong Lớp" value={generalStats.total_exams} prefix={<BookOutlined style={{color: '#52c41a'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={12}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Tổng Lượt Nộp Bài Của Học Sinh" value={generalStats.total_submissions} prefix={<FileTextOutlined style={{color: '#722ed1'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={12}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Điểm TB Các Lớp" value={generalStats.average_score} precision={2} prefix={<CheckCircleOutlined style={{color: '#eb2f96'}}/>} />
                                </Card>
                            </Col>
                        </>
                    )}

                    {generalStats.admin_view && (
                        <>
                            <Col xs={24} sm={12} md={8}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Tổng Số Học Sinh Hệ Thống" value={generalStats.total_students} prefix={<UserOutlined style={{color: '#1890ff'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Tổng Giáo Viên Hệ Thống" value={generalStats.total_teachers} prefix={<UserOutlined style={{color: '#faad14'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Số Đề Thi Đã Tạo" value={generalStats.total_exams} prefix={<BookOutlined style={{color: '#52c41a'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={12}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Tổng Lượt Nộp Bài" value={generalStats.total_submissions} prefix={<FileTextOutlined style={{color: '#722ed1'}}/>} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={12}>
                                <Card bordered={false} hoverable style={{ borderRadius: '8px' }}>
                                    <Statistic title="Điểm TB Toàn Hệ Thống" value={generalStats.average_score} precision={2} prefix={<CheckCircleOutlined style={{color: '#eb2f96'}}/>} />
                                </Card>
                            </Col>
                        </>
                    )}
                </Row>
            ) : (
                <p>Bạn không có quyền xem thống kê tổng quan.</p>
            )}

            <Divider />

            <Title level={3}>Phân Tích Bảng Điểm Qua Đề Thi</Title>
            <Card bordered={false} style={{ borderRadius: '8px', marginBottom: '24px' }}>
                <Space style={{ marginBottom: 24, flexWrap: 'wrap' }} size="large">
                    {/* Bước 1: Chọn Lớp */}
                    <div>
                        <div style={{ marginBottom: 4 }}><b>1. Chọn Lớp Học ({user?.role === 'admin' ? 'Toàn hệ thống' : 'Của tôi'}):</b></div>
                        <Select
                            placeholder="Chọn lớp học..."
                            style={{ width: 250 }}
                            onChange={handleClassChange}
                            value={selectedClassId}
                        >
                            {classes.map(c => (
                                <Option key={c.id} value={c.id}>
                                    {c.name} ({c.code || '-'})
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Bước 2: Chọn Môn học */}
                    <div>
                        <div style={{ marginBottom: 4 }}><b>2. Chọn Môn Học:</b></div>
                        <Select
                            placeholder="Chọn môn học..."
                            style={{ width: 250 }}
                            onChange={handleSubjectChange}
                            value={selectedSubjectId}
                            disabled={!selectedClassId || subjects.length === 0}
                        >
                            {subjects.map(s => (
                                <Option key={s.id} value={s.id}>
                                    {s.name}
                                </Option>
                            ))}
                        </Select>
                        {selectedClassId && subjects.length === 0 && (
                            <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>
                                Lớp này chưa có môn học nào.
                            </div>
                        )}
                    </div>

                    {/* Bước 3: Chọn Bài thi */}
                    <div>
                        <div style={{ marginBottom: 4 }}><b>3. Chọn Đề Thi:</b></div>
                        <Select
                            placeholder="Chọn đề thi..."
                            style={{ width: 250 }}
                            onChange={handleExamChange}
                            value={selectedExamId}
                            disabled={!selectedSubjectId || exams.length === 0}
                        >
                            {exams.map(e => (
                                <Option key={e.id} value={e.id}>
                                    {e.title}
                                </Option>
                            ))}
                        </Select>
                        {selectedSubjectId && exams.length === 0 && (
                            <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>
                                Môn học này chưa có bài thi nào.
                            </div>
                        )}
                    </div>
                </Space>

                {examLoading ? <Skeleton active /> : examStats && (
                    <div style={{ marginTop: 16 }}>
                        <Title level={4} style={{ color: '#1890ff', marginBottom: 8 }}>Kỳ thi: {examStats.exam_title}</Title>
                        {examStats.subject_name && (
                            <p style={{ color: '#666', marginBottom: 24 }}>
                                📚 Môn: <b>{examStats.subject_name}</b>
                                {examStats.class_name && <span> — Lớp: <b>{examStats.class_name}</b></span>}
                            </p>
                        )}

                        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                            <Col xs={12} md={6}>
                                <Statistic
                                    title="Học sinh đã nộp / Tổng lượt nộp"
                                    value={`${examStats.total_participants} / ${examStats.total_submissions}`}
                                />
                            </Col>
                            <Col xs={8} md={6}>
                                <Statistic title="Điểm Max" value={examStats.highest_score} valueStyle={{ color: '#3f8600' }} />
                            </Col>
                            <Col xs={8} md={6}>
                                <Statistic title="Điểm Min" value={examStats.lowest_score} valueStyle={{ color: '#cf1322' }} />
                            </Col>
                            <Col xs={8} md={6}>
                                <Statistic title="Điểm Trung Bình" value={examStats.average_score} valueStyle={{ color: '#096dd9' }} />
                            </Col>
                        </Row>

                        <Row gutter={[32, 32]}>
                            <Col xs={24} xl={12}>
                                <Card type="inner" title="Biểu Đồ Phổ Điểm">
                                    <div style={{ height: 350, width: '100%' }}>
                                        <ResponsiveContainer>
                                            <BarChart data={examStats.score_distribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="count" name="Số học sinh đạt" fill="#8884d8" barSize={50} radius={[5, 5, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </Col>

                            <Col xs={24} xl={12}>
                                <Card type="inner" title="Danh Sách Kết Quả Học Sinh">
                                    <Table
                                        dataSource={examStats.student_results}
                                        columns={studentTableColumns}
                                        rowKey="id"
                                        pagination={{ pageSize: 6 }}
                                        size="small"
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Statistics;
