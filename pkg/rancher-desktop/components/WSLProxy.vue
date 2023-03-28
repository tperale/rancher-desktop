<script lang="ts">
import { Checkbox } from '@rancher/components';
import Vue from 'vue';

import RdFieldset from '@pkg/components/form/RdFieldset.vue';
import { Settings } from '@pkg/config/settings';
import { RecursiveTypes } from '@pkg/utils/typeUtils';

import type { PropType } from 'vue';

export default Vue.extend({
  name: 'wsl-proxy',

  components: { Checkbox, RdFieldset },

  props: {
    description: {
      type:    String,
      default: '',
    },
    preferences: {
      type:     Object as PropType<Settings>,
      required: true,
    },
  },
  computed: {
    isFieldDisabled() {
      return !(this.preferences.experimental.virtualMachine.proxy.enabled);
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
    <section class="wsl-proxy">
      <checkbox
        :label="t('proxy.windows.description', { }, true)"
        :value="preferences.experimental.virtualMachine.proxy.enabled"
        @input="onChange('experimental.virtualMachine.proxy.enabled', $event)"
      />
      <hr>
      <rd-fieldset
        class="wsl-proxy-fieldset"
        :legend-text="t('proxy.windows.addressTitle', { }, true)"
      >
        <input
          :placeholder="t('proxy.windows.address', { }, true)"
          :disabled="isFieldDisabled"
          :value="preferences.experimental.virtualMachine.proxy.address"
          class="wsl-proxy-field"
          @input="onChange('experimental.virtualMachine.proxy.address', $event.target.value)"
        />
        <input
          type="number"
          :placeholder="t('proxy.windows.port', { }, true)"
          :disabled="isFieldDisabled"
          :value="preferences.experimental.virtualMachine.proxy.port"
          class="wsl-proxy-field"
          @input="onChange('experimental.virtualMachine.proxy.port', $event.target.value)"
        />
      </rd-fieldset>
      <rd-fieldset
        class="wsl-proxy-fieldset"
        :legend-text="t('proxy.windows.authTitle', { }, true)"
      >
        <input
          :placeholder="t('proxy.windows.username', { }, true)"
          :disabled="isFieldDisabled"
          :value="preferences.experimental.virtualMachine.proxy.username"
          class="wsl-proxy-field"
          @input="onChange('experimental.virtualMachine.proxy.username', $event.target.value)"
        />
        <input
          type="password"
          :placeholder="t('proxy.windows.password', { }, true)"
          :disabled="isFieldDisabled"
          :value="preferences.experimental.virtualMachine.proxy.password"
          class="wsl-proxy-field"
          @input="onChange('experimental.virtualMachine.proxy.password', $event.target.value)"
        />
      </rd-fieldset>
    </section>
  </div>
</template>

<style lang="scss" scoped>
  .wsl-proxy {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: grey;
  }
  .wsl-proxy-fieldset {
    display: flex;
    flex-direction: row;
    gap: .5rem;
  }
  .wsl-proxy-field {
    width: 100%;
  }
</style>
