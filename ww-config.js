export default {
  editor: {
    label: 'Entrustia Invite Cards',
    icon: 'person',
  },
  properties: {
    data: {
      label: { en: 'Invite Data' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        {
          id: 1,
          created_at: '2026-03-03T10:14:00.000Z',
          tenant_id: 1,
          email: 'aeris@example.com',
          role: 'member',
          token: 'abc123',
          expires_at: '2026-03-10T11:14:00.000Z',
          accepted_at: null
        }
      ],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item.email || 'Item ' + (item.id || 'Unknown');
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: 1,
            created_at: '',
            tenant_id: 1,
            email: 'user@example.com',
            role: 'member',
            token: '',
            expires_at: '',
            accepted_at: null
          },
          options: {
            item: {
              id: { label: { en: 'ID' }, type: 'Number' },
              created_at: { label: { en: 'Created At' }, type: 'Text' },
              tenant_id: { label: { en: 'Tenant ID' }, type: 'Number' },
              email: { label: { en: 'Email' }, type: 'Text' },
              role: { label: { en: 'Role' }, type: 'Text' },
              token: { label: { en: 'Token' }, type: 'Text' },
              expires_at: { label: { en: 'Expires At' }, type: 'Text' },
              accepted_at: { label: { en: 'Accepted At' }, type: 'Text' }
            }
          }
        }
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of invite objects from Xano'
      },
      /* wwEditor:end */
    },

    dataIdFormula: {
      label: { en: 'ID Field' },
      type: 'Formula',
      section: 'settings',
      options: content => ({
        template: Array.isArray(content.data) && content.data.length > 0 ? content.data[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['id']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.data) || !content.data.length || !boundProps.data,
    },

    dataEmailFormula: {
      label: { en: 'Email Field' },
      type: 'Formula',
      section: 'settings',
      options: content => ({
        template: Array.isArray(content.data) && content.data.length > 0 ? content.data[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['email']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.data) || !content.data.length || !boundProps.data,
    },

    dataRoleFormula: {
      label: { en: 'Role Field' },
      type: 'Formula',
      section: 'settings',
      options: content => ({
        template: Array.isArray(content.data) && content.data.length > 0 ? content.data[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['role']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.data) || !content.data.length || !boundProps.data,
    },

    dataStatusFormula: {
      label: { en: 'Status Field (expires_at / accepted_at)' },
      type: 'Formula',
      section: 'settings',
      options: content => ({
        template: Array.isArray(content.data) && content.data.length > 0 ? content.data[0] : null,
      }),
      defaultValue: {
        type: 'f',
        code: "context.mapping?.['expires_at']",
      },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content.data) || !content.data.length || !boundProps.data,
    },
  },

  triggerEvents: [
    {
      name: 'revoke-click',
      label: { en: 'On Revoke Click' },
      event: { row: null },
      default: true,
    },
    {
      name: 'resend-click',
      label: { en: 'On Resend Click' },
      event: { row: null },
    },
    {
      name: 'email-click',
      label: { en: 'On Email Click' },
      event: { row: null },
    },
  ],
};
