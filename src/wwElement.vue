<template>
  <div class="invite-cards-wrapper">

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="search-input-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          class="search-input"
          type="text"
          placeholder="Search invites"
          :value="searchText"
          @input="searchText = $event.target.value"
        />
        <button v-if="searchText" class="clear-btn" @click="searchText = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="filter-dropdown-wrap">
        <select class="filter-dropdown" :value="roleFilter" @change="roleFilter = $event.target.value">
          <option value="">All Roles</option>
          <option v-for="r in uniqueRoles" :key="r" :value="r">{{ r }}</option>
        </select>
        <button v-if="roleFilter" class="clear-btn" @click="roleFilter = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="filter-dropdown-wrap">
        <select class="filter-dropdown" :value="statusFilter" @change="statusFilter = $event.target.value">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Expired">Expired</option>
          <option value="Accepted">Accepted</option>
        </select>
        <button v-if="statusFilter" class="clear-btn" @click="statusFilter = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <button class="reset-link" @click="resetFilters">Reset</button>
    </div>

    <!-- Cards -->
    <div
      v-for="item in filteredItems"
      :key="item.id || item.email"
      class="invite-card"
    >
      <!-- Action Button -->
      <div class="card-action-row">
        <button
          v-if="deriveStatus(item) === 'Pending'"
          class="btn-revoke"
          :style="getRevokeButtonStyle(item.id)"
          @mouseenter="setHover('revoke', item.id, true)"
          @mouseleave="setHover('revoke', item.id, false)"
          @mousedown="setActive('revoke', item.id, true)"
          @mouseup="setActive('revoke', item.id, false)"
          @click="onRevokeClick(item)"
        >Revoke</button>
        <button
          v-else
          class="btn-resend"
          :style="getResendButtonStyle(item.id)"
          @mouseenter="setHover('resend', item.id, true)"
          @mouseleave="setHover('resend', item.id, false)"
          @mousedown="setActive('resend', item.id, true)"
          @mouseup="setActive('resend', item.id, false)"
          @click="onResendClick(item)"
        >Resend</button>
        <span class="card-status" :class="'status-' + deriveStatus(item).toLowerCase()">
          {{ deriveStatus(item) }}
        </span>
      </div>

      <!-- Email -->
      <div class="card-row">
        <span class="card-label">Email</span>
        <span class="card-value email-link" @click="onEmailClick(item)">{{ item.email || '' }}</span>
      </div>

      <!-- Role -->
      <div class="card-row">
        <span class="card-label">Role</span>
        <span class="card-value">{{ item.role || '' }}</span>
      </div>

      <!-- Sent -->
      <div class="card-row">
        <span class="card-label">Sent</span>
        <span class="card-value">{{ formatDate(item.created_at) }}</span>
      </div>

      <!-- Expires -->
      <div class="card-row">
        <span class="card-label">Expires</span>
        <span class="card-value">{{ formatDate(item.expires_at) }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredItems.length === 0" class="empty-state">
      No invites match your filters.
    </div>

  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'EntrustiaInviteCards',
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {

    /* wwEditor:start */
    const isEditing = computed(() => props.wwEditorState && props.wwEditorState.isEditing);
    /* wwEditor:end */

    // ── Filter state ──────────────────────────────────────────
    const searchText = ref('');
    const roleFilter = ref('');
    const statusFilter = ref('');

    // ── Hover / active button state ───────────────────────────
    const hoverState = ref({});
    const activeState = ref({});

    function setHover(type, id, val) {
      const key = type + '_' + id;
      hoverState.value = Object.assign({}, hoverState.value, { [key]: val });
    }
    function setActive(type, id, val) {
      const key = type + '_' + id;
      activeState.value = Object.assign({}, activeState.value, { [key]: val });
    }

    function getRevokeButtonStyle(id) {
      const key = 'revoke_' + id;
      const isHovered = hoverState.value[key] || false;
      const isActive = activeState.value[key] || false;
      if (isActive) {
        return { backgroundColor: '#1a3d2e', borderColor: '#1a3d2e', color: '#ffffff' };
      }
      if (isHovered) {
        return { backgroundColor: '#ffffff', borderColor: '#c0392b', color: '#c0392b' };
      }
      return {};
    }

    function getResendButtonStyle(id) {
      const key = 'resend_' + id;
      const isHovered = hoverState.value[key] || false;
      const isActive = activeState.value[key] || false;
      if (isActive) {
        return { backgroundColor: '#1a3d2e', borderColor: '#1a3d2e', color: '#ffffff' };
      }
      if (isHovered) {
        return { backgroundColor: '#f0f8f4', borderColor: '#2d6a4f', color: '#2d6a4f' };
      }
      return {};
    }

    // ── Date formatter ────────────────────────────────────────
    function formatDate(ts) {
      if (!ts) return '';
      try {
        const d = new Date(ts);
        if (isNaN(d.getTime())) return '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mo = months[d.getMonth()];
        const day = d.getDate();
        const yr = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return mo + ' ' + day + ', ' + yr + ' ' + hh + ':' + mm;
      } catch (e) {
        return '';
      }
    }

    // ── Status derivation (matches datagrid logic) ────────────
    // Pending = not expired AND not accepted
    // Expired = expires_at is in the past AND not accepted
    // Accepted = accepted_at is not null
    function deriveStatus(item) {
      if (item.accepted_at) return 'Accepted';
      const now = new Date();
      const expires = item.expires_at ? new Date(item.expires_at) : null;
      if (expires && expires < now) return 'Expired';
      return 'Pending';
    }

    // ── Processed items (with formula mapping) ─────────────────
    const processedItems = computed(() => {
      const items = props.content && props.content.data || [];
      const { resolveMappingFormula } = wwLib.wwFormula.useFormula();

      return items.map(function(item) {
        const id = resolveMappingFormula(props.content && props.content.dataIdFormula, item) || item.id;
        const email = resolveMappingFormula(props.content && props.content.dataEmailFormula, item) || item.email;
        const role = resolveMappingFormula(props.content && props.content.dataRoleFormula, item) || item.role;

        return {
          id: id || 'item-' + Math.random(),
          email: email || '',
          role: role || '',
          created_at: item.created_at || '',
          expires_at: item.expires_at || '',
          accepted_at: item.accepted_at || null,
          originalItem: item,
        };
      });
    });

    // ── Unique roles for dropdown ──────────────────────────────
    const uniqueRoles = computed(function() {
      const seen = {};
      const roles = [];
      const items = processedItems.value || [];
      for (var i = 0; i < items.length; i++) {
        const r = items[i].role || '';
        if (r && !seen[r]) {
          seen[r] = true;
          roles.push(r);
        }
      }
      return roles;
    });

    // ── Filtered items ─────────────────────────────────────────
    const filteredItems = computed(function() {
      const items = processedItems.value || [];
      const search = (searchText.value || '').toLowerCase();
      const role = roleFilter.value || '';
      const status = statusFilter.value || '';

      return items.filter(function(item) {
        if (search && (item.email || '').toLowerCase().indexOf(search) === -1) return false;
        if (role && (item.role || '') !== role) return false;
        if (status && deriveStatus(item) !== status) return false;
        return true;
      });
    });

    // ── Reset ──────────────────────────────────────────────────
    function resetFilters() {
      searchText.value = '';
      roleFilter.value = '';
      statusFilter.value = '';
    }

    // ── Internal variables ─────────────────────────────────────
    const { value: selectedItem, setValue: setSelectedItem } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedItem',
      type: 'object',
      defaultValue: null,
    });

    const { value: itemCount, setValue: setItemCount } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'itemCount',
      type: 'number',
      defaultValue: 0,
    });

    const { value: filteredCount, setValue: setFilteredCount } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'filteredCount',
      type: 'number',
      defaultValue: 0,
    });

    watch(processedItems, function(items) {
      setItemCount((items || []).length);
    }, { immediate: true });

    watch(filteredItems, function(items) {
      setFilteredCount((items || []).length);
    }, { immediate: true });

    // ── Trigger events ─────────────────────────────────────────
    function onRevokeClick(item) {
      setSelectedItem(item.originalItem || item);
      emit('trigger-event', { name: 'revoke-click', event: { row: item.originalItem || item } });
    }

    function onResendClick(item) {
      setSelectedItem(item.originalItem || item);
      emit('trigger-event', { name: 'resend-click', event: { row: item.originalItem || item } });
    }

    function onEmailClick(item) {
      setSelectedItem(item.originalItem || item);
      emit('trigger-event', { name: 'email-click', event: { row: item.originalItem || item } });
    }

    return {
      props,
      searchText,
      roleFilter,
      statusFilter,
      uniqueRoles,
      filteredItems,
      resetFilters,
      deriveStatus,
      formatDate,
      setHover,
      setActive,
      getRevokeButtonStyle,
      getResendButtonStyle,
      onRevokeClick,
      onResendClick,
      onEmailClick,
      /* wwEditor:start */
      isEditing,
      /* wwEditor:end */
    };
  }
};
</script>

<style scoped>
.invite-cards-wrapper {
  width: 100%;
  box-sizing: border-box;
}

/* ── Filter bar ───────────────────────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0 0 0 0;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 140px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #ffffff;
  padding: 0 8px;
  height: 36px;
  box-sizing: border-box;
}

.search-icon {
  flex-shrink: 0;
  margin-right: 6px;
}

.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 13px;
  color: #333;
  background: transparent;
  padding: 0;
  min-width: 0;
}

.search-input::placeholder {
  color: #aaa;
}

.filter-dropdown-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #ffffff;
  height: 36px;
  padding: 0 8px;
  box-sizing: border-box;
}

.filter-dropdown {
  border: none;
  outline: none;
  font-size: 13px;
  color: #333;
  background: transparent;
  cursor: pointer;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  padding-right: 16px;
}

.clear-btn {
  background: none;
  border: none;
  padding: 0 0 0 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #888;
  flex-shrink: 0;
}

.clear-btn:hover {
  color: #333;
}

.reset-link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  text-decoration: underline;
  white-space: nowrap;
  flex-shrink: 0;
}

.reset-link:hover {
  color: #111;
}

/* ── Cards ───────────────────────────────────────────────── */
.invite-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 14px 16px;
  box-sizing: border-box;
  width: 100%;
  margin-top: 16px;
}

.invite-card:first-of-type {
  margin-top: 10px;
}

.card-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f2f2f2;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  font-size: 12px;
  color: #888;
  font-weight: 500;
  min-width: 70px;
  flex-shrink: 0;
}

.card-value {
  font-size: 13px;
  color: #333;
  text-align: right;
  word-break: break-word;
}

.email-link {
  color: #2d6a4f;
  cursor: pointer;
  text-decoration: underline;
}

/* ── Action buttons ───────────────────────────────────────── */
.btn-revoke {
  border: 1.5px solid #c0392b;
  background: #ffffff;
  color: #c0392b;
  border-radius: 20px;
  padding: 5px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-resend {
  border: 1.5px solid #2d6a4f;
  background: #ffffff;
  color: #2d6a4f;
  border-radius: 20px;
  padding: 5px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

/* ── Status badge ─────────────────────────────────────────── */
.card-status {
  font-size: 13px;
  font-weight: 500;
}

.status-pending {
  color: #2d6a4f;
}

.status-expired {
  color: #888;
}

.status-accepted {
  color: #2563eb;
}

/* ── Empty state ──────────────────────────────────────────── */
.empty-state {
  text-align: center;
  color: #aaa;
  font-size: 13px;
  padding: 24px 0;
  margin-top: 10px;
}
</style>
