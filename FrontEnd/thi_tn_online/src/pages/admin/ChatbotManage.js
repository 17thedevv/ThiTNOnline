import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message } from "antd";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { chatbotService } from "../../api/chatbot";
import "./ChatbotManage.css";

const { Option } = Select;
const { TextArea } = Input;

const ChatbotManage = () => {
  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [responsesData, statsData] = await Promise.all([
        chatbotService.getResponses(),
        chatbotService.getStats()
      ]);
      setResponses(responsesData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = () => {
    setEditingResponse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditResponse = (response) => {
    setEditingResponse(response);
    form.setFieldsValue(response);
    setModalVisible(true);
  };

  const handleSaveResponse = async (values) => {
    try {
      if (editingResponse) {
        // Update existing response
        await chatbotService.updateResponse(editingResponse.id, values);
        message.success("Cập nhật thành công");
      } else {
        // Create new response
        await chatbotService.createResponse(values);
        message.success("Tạo thành công");
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Error saving response:", error);
      message.error("Không thể lưu phản hồi");
    }
  };

  const handleDeleteResponse = async (id) => {
    try {
      await chatbotService.deleteResponse(id);
      message.success("Xóa thành công");
      loadData();
    } catch (error) {
      console.error("Error deleting response:", error);
      message.error("Không thể xóa phản hồi");
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      greeting: "green",
      help: "blue",
      exam: "orange",
      study: "purple",
      technical: "red",
      account: "cyan",
      other: "default"
    };
    return colors[category] || "default";
  };

  const getCategoryName = (category) => {
    const names = {
      greeting: "Chào hỏi",
      help: "Trợ giúp",
      exam: "Bài thi",
      study: "Học tập",
      technical: "Kỹ thuật",
      account: "Tài khoản",
      other: "Khác"
    };
    return names[category] || category;
  };

  const columns = [
    {
      title: "Pattern",
      dataIndex: "pattern",
      key: "pattern",
      ellipsis: true,
      render: (text) => <code>{text}</code>
    },
    {
      title: "Phản hồi",
      dataIndex: "response",
      key: "response",
      ellipsis: true,
      width: 300
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {getCategoryName(category)}
        </Tag>
      )
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      sorter: (a, b) => a.priority - b.priority,
      render: (priority) => (
        <Tag color={priority >= 8 ? "red" : priority >= 5 ? "orange" : "default"}>
          {priority}
        </Tag>
      )
    },
    {
      title: "Quick Replies",
      dataIndex: "quick_replies",
      key: "quick_replies",
      render: (quick_replies) => (
        <div>
          {quick_replies?.map((reply, index) => (
            <Tag key={index} size="small">{reply}</Tag>
          ))}
        </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Đã tắt"}
        </Tag>
      )
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<FiEdit2 />}
            onClick={() => handleEditResponse(record)}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<FiTrash2 />}
            onClick={() => handleDeleteResponse(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="chatbot-manage">
      <div className="manage-header">
        <h1>Quản lý Chatbot</h1>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={handleAddResponse}
        >
          Thêm phản hồi
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <h3>{stats.total_conversations}</h3>
            <p>Cuộc trò chuyện</p>
          </div>
          <div className="stat-card">
            <h3>{stats.total_messages}</h3>
            <p>Tin nhắn</p>
          </div>
          <div className="stat-card">
            <h3>{stats.active_users}</h3>
            <p>Người dùng hoạt động</p>
          </div>
        </div>
      )}

      {/* Responses Table */}
      <Table
        columns={columns}
        dataSource={responses}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} phản hồi`
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        title={editingResponse ? "Cập nhật phản hồi" : "Thêm phản hồi mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveResponse}
        >
          <Form.Item
            name="pattern"
            label="Pattern"
            rules={[{ required: true, message: "Vui lòng nhập pattern" }]}
            help="Sử dụng * làm wildcard, | cho OR. Ví dụ: *xin chào*|*hello*"
          >
            <Input placeholder="*xin chào*|*hello*" />
          </Form.Item>

          <Form.Item
            name="response"
            label="Phản hồi"
            rules={[{ required: true, message: "Vui lòng nhập phản hồi" }]}
          >
            <TextArea rows={4} placeholder="Nội dung phản hồi của chatbot" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              <Option value="greeting">Chào hỏi</Option>
              <Option value="help">Trợ giúp</Option>
              <Option value="exam">Bài thi</Option>
              <Option value="study">Học tập</Option>
              <Option value="technical">Kỹ thuật</Option>
              <Option value="account">Tài khoản</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[{ required: true, message: "Vui lòng nhập độ ưu tiên" }]}
            help="Số càng cao càng ưu tiên"
          >
            <Input type="number" placeholder="0-10" min={0} max={10} />
          </Form.Item>

          <Form.Item
            name="quick_replies"
            label="Quick Replies"
            help="Các nút trả lời nhanh, mỗi dòng một option"
          >
            <TextArea
              rows={3}
              placeholder="Hướng dẫn sử dụng&#10;Câu hỏi thường gặp&#10;Liên hệ hỗ trợ"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Đã tắt</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingResponse ? "Cập nhật" : "Tạo"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatbotManage;
