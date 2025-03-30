import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { $baseApi } from "@/api";

type Announcement = {
  id: number;
  headline: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementFormData = {
  headline: string;
  body: string;
};

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [form] = Form.useForm<AnnouncementFormData>();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await $baseApi.get("/announcements");
      setAnnouncements(response.data);
    } catch (error) {
      message.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = () => {
    form.resetFields();
    setModalMode("create");
    setSelectedAnnouncement(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Announcement) => {
    form.setFieldsValue({
      headline: record.headline,
      body: record.body,
    });
    setModalMode("edit");
    setSelectedAnnouncement(record);
    setModalVisible(true);
  };

  const handleDelete = (record: Announcement) => {
    Modal.confirm({
      title: "Are you sure you want to delete this announcement?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await $baseApi.delete(`/announcements/${record.id}`);
          message.success("Announcement deleted successfully");
          fetchAnnouncements();
        } catch (error) {
          message.error("Failed to delete announcement");
        }
      },
    });
  };

  const handleSubmit = async (values: AnnouncementFormData) => {
    try {
      if (modalMode === "create") {
        await $baseApi.post("/announcements", values);
        message.success("Announcement created successfully");
      } else {
        await $baseApi.patch(
          `/announcements/${selectedAnnouncement?.id}`,
          values
        );
        message.success("Announcement updated successfully");
      }
      setModalVisible(false);
      fetchAnnouncements();
    } catch (error) {
      message.error(`Failed to ${modalMode} announcement`);
    }
  };

  const columns = [
    {
      title: "Headline",
      dataIndex: "headline",
      key: "headline",
    },
    {
      title: "Body",
      dataIndex: "body",
      key: "body",
      ellipsis: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Announcement) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            type="link"
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl mb-8">Manage Announcements</h1>
      <div className="mb-4">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Announcement
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={announcements}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={
          modalMode === "create" ? "Create Announcement" : "Edit Announcement"
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="headline"
            label="Headline"
            rules={[{ required: true, message: "Please enter the headline" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="body"
            label="Body"
            rules={[{ required: true, message: "Please enter the body" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {modalMode === "create" ? "Create" : "Update"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
