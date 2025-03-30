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
  DatePicker,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { $baseApi } from "@/api";
import type { UploadFile } from "antd/es/upload/interface";

type Event = {
  id: number;
  title: string;
  image: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type EventFormData = {
  title: string;
  body: string;
  image?: UploadFile[];
  eventAt: string;
};

const dateFormat = "YYYY/MM/DD";

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [form] = Form.useForm<EventFormData>();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await $baseApi.get("/events");
      setEvents(response.data);
    } catch (error) {
      message.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = () => {
    form.resetFields();
    setModalMode("create");
    setSelectedEvent(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Event) => {
    form.setFieldsValue({
      title: record.title,
      body: record.body,
      image: record.image
        ? [
            {
              uid: "-1",
              name: "current-image",
              status: "done",
              url: `${import.meta.env.VITE_APP_URL}/public/uploads/events/${
                record.image
              }`,
            },
          ]
        : [],
    });
    setModalMode("edit");
    setSelectedEvent(record);
    setModalVisible(true);
  };

  const handleDelete = (record: Event) => {
    Modal.confirm({
      title: "Are you sure you want to delete this event?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await $baseApi.delete(`/events/${record.id}`);
          message.success("Event deleted successfully");
          fetchEvents();
        } catch (error) {
          message.error("Failed to delete event");
        }
      },
    });
  };

  const handleSubmit = async (values: EventFormData) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("body", values.body);
      formData.append("eventAt", values.eventAt);

      if (values.image?.[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      if (modalMode === "create") {
        await $baseApi.post("/events", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Event created successfully");
      } else {
        await $baseApi.put(`/events/${selectedEvent?.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Event updated successfully");
      }
      setModalVisible(false);
      fetchEvents();
    } catch (error) {
      message.error(`Failed to ${modalMode} event`);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) =>
        image ? (
          <Image
            src={`${image}`}
            alt="Event"
            width={100}
            height={100}
            style={{ objectFit: "cover" }}
          />
        ) : (
          "No image"
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
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
      title: "Event At",
      dataIndex: "eventAt",
      key: "eventAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Event) => (
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
      <h1 className="text-2xl mb-8">Manage Events</h1>
      <div className="mb-4">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Event
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={modalMode === "create" ? "Create Event" : "Edit Event"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter the title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image"
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
              {form.getFieldValue("image")?.length ? null : (
                <div style={{ padding: "32px 0" }}>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="body"
            label="Body"
            rules={[{ required: true, message: "Please enter the body" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="eventAt"
            label="Event At"
            rules={[{ required: true, message: "Please choose a date" }]}
          >
            <DatePicker format={dateFormat} />
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
