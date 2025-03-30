import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Upload,
  Image,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { $baseApi } from "@/api";
import type { UploadFile } from "antd/es/upload/interface";

type Forum = {
  id: number;
  name: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
};

type ForumFormData = {
  name: string;
  logo?: UploadFile[];
};

export const ForumsPage: React.FC = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [form] = Form.useForm<ForumFormData>();

  const fetchForums = async () => {
    try {
      setLoading(true);
      const response = await $baseApi.get("/forums");
      setForums(response.data);
    } catch (error) {
      message.error("Failed to fetch forums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForums();
  }, []);

  const handleCreate = () => {
    form.resetFields();
    setModalMode("create");
    setSelectedForum(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Forum) => {
    form.setFieldsValue({
      name: record.name,
      logo: record.logo
        ? [
            {
              uid: "-1",
              name: "current-logo",
              status: "done",
              url: `${import.meta.env.VITE_APP_URL}/public/uploads/forums/${
                record.logo
              }`,
            },
          ]
        : [],
    });
    setModalMode("edit");
    setSelectedForum(record);
    setModalVisible(true);
  };

  const handleDelete = (record: Forum) => {
    Modal.confirm({
      title: "Are you sure you want to delete this forum?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await $baseApi.delete(`/forums/${record.id}`);
          message.success("Forum deleted successfully");
          fetchForums();
        } catch (error) {
          message.error("Failed to delete forum");
        }
      },
    });
  };

  const handleSubmit = async (values: ForumFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);

      if (values.logo?.[0]?.originFileObj) {
        formData.append("logo", values.logo[0].originFileObj);
      }

      if (modalMode === "create") {
        await $baseApi.post("/forums", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Forum created successfully");
      } else {
        await $baseApi.put(`/forums/${selectedForum?.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Forum updated successfully");
      }
      setModalVisible(false);
      fetchForums();
    } catch (error) {
      message.error(`Failed to ${modalMode} forum`);
    }
  };

  const columns = [
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      render: (logo: string) =>
        logo ? (
          <Image
            src={`${logo}`}
            alt="Forum Logo"
            width={50}
            height={50}
            style={{ objectFit: "cover" }}
          />
        ) : (
          "No logo"
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
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
      render: (_: any, record: Forum) => (
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
      <h1 className="text-2xl mb-8">Manage Forums</h1>
      <div className="mb-4">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Forum
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={forums}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={modalMode === "create" ? "Create Forum" : "Edit Forum"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the forum name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="logo"
            label="Logo"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              {form.getFieldValue("logo")?.length ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
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
