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
                'services/databases/postgresql/troubleshooting',
              ],
            },
            {
              type: 'category',
              label: 'MySQL',
              items: [
                'services/databases/mysql/overview',
              ],
            },
            {
              type: 'category',
              label: 'Redis',
              items: [
                'services/databases/redis/overview',
              ],
            },
            {
              type: 'category',
              label: 'ClickHouse',
              items: [
                'services/databases/clickhouse/overview',
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
              ],
            },
            {
              type: 'category',
              label: 'GPU',
              items: [
                'services/compute/gpu/overview',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Kubernetes',
          items: [
            'services/kubernetes/quick-start',
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
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '🛠️ Tools',
      items: [
        'tools/terraform',
      ],
    },
  ],
};

export default sidebars; 