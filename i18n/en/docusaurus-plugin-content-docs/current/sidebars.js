// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  "docsSidebar": [
    {
      "type": "doc",
      "id": "get-started"
    },
    {
      "type": "category",
      "label": "🚀 Get Started",
      "items": [
        "getting-started/introduction",
        "getting-started/concepts",
        "getting-started/quick-start"
      ]
    },
    {
      "type": "category",
      "label": "💾 Services",
      "items": [
        {
          "type": "category",
          "label": "Storage",
          "items": [
            {
              "type": "category",
              "label": "Buckets",
              "items": [
                "services/storage/buckets/overview",
                "services/storage/buckets/quick-start",
                "services/storage/buckets/api-reference"
              ]
            }
          ]
        },
        {
          "type": "category",
          "label": "Databases",
          "items": [
            {
              "type": "category",
              "label": "ClickHouse",
              "items": [
                "services/databases/clickhouse/overview",
                "services/databases/clickhouse/quick-start",
                "services/databases/clickhouse/api-reference"
              ]
            },
            {
              "type": "category",
              "label": "PostgreSQL",
              "items": [
                "services/databases/postgresql/overview",
                "services/databases/postgresql/quick-start",
                "services/databases/postgresql/api-reference"
              ]
            },
            {
              "type": "category",
              "label": "MySQL",
              "items": [
                "services/databases/mysql/overview",
                "services/databases/mysql/quick-start",
                "services/databases/mysql/api-reference"
              ]
            },
            {
              "type": "category",
              "label": "Redis",
              "items": [
                "services/databases/redis/overview",
                "services/databases/redis/quick-start",
                "services/databases/redis/api-reference"
              ]
            }
          ]
        },
        {
          "type": "category",
          "label": "Compute",
          "items": [
            "services/compute/overview",
            "services/compute/quick-start",
            "services/compute/api-reference"
          ]
        },
        {
          "type": "category",
          "label": "GPU",
          "items": [
            "services/gpu/overview",
            "services/gpu/quick-start",
            "services/gpu/api-reference"
          ]
        },
        {
          "type": "category",
          "label": "Kubernetes",
          "items": [
            "services/kubernetes/overview",
            "services/kubernetes/quick-start",
            "services/kubernetes/api-reference"
          ]
        },
        {
          "type": "category",
          "label": "Messaging",
          "items": [
            {
              "type": "category",
              "label": "Kafka",
              "items": [
                "services/messaging/kafka/overview",
                "services/messaging/kafka/quick-start",
                "services/messaging/kafka/api-reference"
              ]
            },
            {
              "type": "category",
              "label": "RabbitMQ",
              "items": [
                "services/messaging/rabbitmq/overview",
                "services/messaging/rabbitmq/quick-start",
                "services/messaging/rabbitmq/api-reference"
              ]
            },
            {
              "type": "category",
              "label": "NATS",
              "items": [
                "services/messaging/nats/overview",
                "services/messaging/nats/quick-start",
                "services/messaging/nats/api-reference"
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "category",
      "label": "📚 Resources",
      "items": [
        "resources/troubleshooting",
        "resources/faq",
        "resources/glossary"
      ]
    },
    {
      "type": "category",
      "label": "🛠️ Tools",
      "items": [
        "tools/terraform"
      ]
    }
  ]
};

export default sidebars;
