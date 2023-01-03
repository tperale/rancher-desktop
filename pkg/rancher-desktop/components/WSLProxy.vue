<script lang="ts">
import Vue from 'vue';

import RdFieldset from '@pkg/components/form/RdFieldset.vue';
import { Settings } from '@pkg/config/settings';
import { RecursiveTypes } from '@pkg/utils/typeUtils';

import type { PropType } from 'vue';

export default Vue.extend({
  name: 'wsl-proxy',

  components: { RdFieldset },

  props: {
    description: {
      type:    String,
      default: '',
    },
    isProxyDisabled: {
      type:    Boolean,
      default: false,
    },
    preferences: {
      type:     Object as PropType<Settings>,
      required: true,
    },
  },

  methods: {
    onChange<P extends keyof RecursiveTypes<Settings>>(property: P, value: RecursiveTypes<Settings>[P]) {
      this.$store.dispatch('preferences/updatePreferencesData', { property, value });
    },
  },
});
</script>

<template>
  <div class="preferences-body">
    <rd-fieldset
      :legend-text="t('proxy.windows.description', { }, true)"
    >
      <section class="wsl-proxy">
        <h3 v-if="description" v-text="description" />
        <rd-fieldset
          :legend-text="t('proxy.windows.addressTitle', { }, true)"
        >
          <rd-fieldset>
            <input
              :placeholder="t('proxy.windows.address', { }, true)"
              :disabled="isProxyDisabled"
              :value="preferences.kubernetes.WSLProxy.address"
              @input="onChange('kubernetes.WSLProxy.address', $event.target.value)"
            />
          </rd-fieldset>
          <rd-fieldset>
            <input
              type="number"
              :placeholder="t('proxy.windows.port', { }, true)"
              :disabled="isProxyDisabled"
              :value="preferences.kubernetes.WSLProxy.port"
              @input="onChange('kubernetes.WSLProxy.port', $event.target.value)"
            />
          </rd-fieldset>
        </rd-fieldset>
        <rd-fieldset
          :legend-text="t('proxy.windows.authTitle', { }, true)"
        >
          <rd-fieldset>
            <input
              :placeholder="t('proxy.windows.username', { }, true)"
              :disabled="isProxyDisabled"
              :value="preferences.kubernetes.WSLProxy.username"
              @input="onChange('kubernetes.WSLProxy.username', $event.target.value)"
            />
          </rd-fieldset>
          <rd-fieldset>
            <input
              type="password"
              :placeholder="t('proxy.windows.password', { }, true)"
              :disabled="isProxyDisabled"
              :value="preferences.kubernetes.WSLProxy.password"
              @input="onChange('kubernetes.WSLProxy.password', $event.target.value)"
            />
          </rd-fieldset>
        </rd-fieldset>
      </section>
    </rd-fieldset>
  </div>
</template>

<style lang="scss" scoped>
  .wsl-proxy {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: grey;
  }
</style>
