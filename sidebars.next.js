// @ts-check

/**
 * Sidebar configuration for the new service-oriented structure
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  nextSidebar: [
    {
      type: 'doc',
      id: 'getting-started/introduction',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: '🚀 Getting Started',
      items: [
        'getting-started/introduction',
        'getting-started/quick-start',
        'getting-started/concepts',
      ],
    },
    {
      type: 'category',
      label: '💾 Services',
      items: [
        {
          type: 'category',
          label: 'Storage',
          items: [
            {
              type: 'category',
              label: 'Buckets',
              items: [
                'services/storage/buckets/overview',
                'services/storage/buckets/quick-start',
                'services/storage/buckets/api-reference',
                'services/storage/buckets/tutorials',
                'services/storage/buckets/troubleshooting',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Databases',
          items: [
            {
              type: 'category',
              label: 'PostgreSQL',
              items: [
                'services/databases/postgresql/overview',
                'services/databases/postgresql/quick-start',
                'services/databases/postgresql/api-reference',
                'services/databases/postgresql/tutorials',
                'services/databases/postgresql/troubleshooting',
              ],
            },
            {
              type: 'category',
              label: 'MySQL',
              items: [
                'services/databases/mysql/overview',
                'services/databases/mysql/quick-start',
                'services/databases/mysql/api-reference',
                'services/databases/mysql/tutorials',
                'services/databases/mysql/troubleshooting',
              ],
            },
            {
              type: 'category',
              label: 'Redis',
              items: [
                'services/databases/redis/overview',
                'services/databases/redis/quick-start',
                'services/databases/redis/api-reference',
                'services/databases/redis/tutorials',
                'services/databases/redis/troubleshooting',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Compute',
          items: [
            {
              type: 'category',
              label: 'Virtual Machines',
              items: [
                'services/compute/virtual-machines/overview',
                'services/compute/virtual-machines/quick-start',
                'services/compute/virtual-machines/api-reference',
                'services/compute/virtual-machines/tutorials',
                'services/compute/virtual-machines/troubleshooting',
              ],
            },
            {
              type: 'category',
              label: 'GPU',
              items: [
                'services/compute/gpu/overview',
                'services/compute/gpu/quick-start',
                'services/compute/gpu/api-reference',
                'services/compute/gpu/tutorials',
                'services/compute/gpu/troubleshooting',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Kubernetes',
          items: [
            'services/kubernetes/overview',
            'services/kubernetes/quick-start',
            'services/kubernetes/api-reference',
            'services/kubernetes/tutorials',
            'services/kubernetes/troubleshooting',
          ],
        },
        {
          type: 'category',
          label: 'Networking',
          items: [
            {
              type: 'category',
              label: 'VPN',
              items: [
                'services/networking/vpn/overview',
                'services/networking/vpn/quick-start',
                'services/networking/vpn/api-reference',
                'services/networking/vpn/tutorials',
                'services/networking/vpn/troubleshooting',
              ],
            },
            {
              type: 'category',
              label: 'Load Balancers',
              items: [
                'services/networking/load-balancers/overview',
                'services/networking/load-balancers/quick-start',
                'services/networking/load-balancers/api-reference',
                'services/networking/load-balancers/tutorials',
                'services/networking/load-balancers/troubleshooting',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Messaging',
          items: [
            {
              type: 'category',
              label: 'Kafka',
              items: [
                'services/messaging/kafka/overview',
                'services/messaging/kafka/quick-start',
                'services/messaging/kafka/api-reference',
                'services/messaging/kafka/tutorials',
                'services/messaging/kafka/troubleshooting',
              ],
            },
            {
              type: 'category',
              label: 'RabbitMQ',
              items: [
                'services/messaging/rabbitmq/overview',
                'services/messaging/rabbitmq/quick-start',
                'services/messaging/rabbitmq/api-reference',
                'services/messaging/rabbitmq/tutorials',
                'services/messaging/rabbitmq/troubleshooting',
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '📚 Resources',
      items: [
        'resources/troubleshooting',
        'resources/faq',
        'resources/glossary',
      ],
    },
    {
      type: 'category',
      label: '🛠️ Tools',
      items: [
        'tools/terraform',
        'tools/cli',
      ],
    },
  ],
};

module.exports = sidebars; 