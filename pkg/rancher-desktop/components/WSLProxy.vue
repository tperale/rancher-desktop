<script lang="ts">
import { mapGetters } from 'vuex';

import RdFieldset from '@pkg/components/form/RdFieldset.vue';
import { RecursiveTypes } from '@pkg/utils/typeUtils';
import { Settings } from '@pkg/config/settings';
import Vue from 'vue';
import Component from 'vue-class-component';
import type { PropType } from 'vue';

export default Vue.extend({
  name: 'wsl-proxy',

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

  components: {
    RdFieldset
  },

  methods: {
    onAddressChange(value: string | null) {
      console.log(this.preferences)
      const property: keyof RecursiveTypes<Settings> = 'kubernetes.WSLProxy.address' as any;
      this.$store.dispatch('preferences/updatePreferencesData', { property, value });
    },

    onPortChange(value: number | null) {
      const property: keyof RecursiveTypes<Settings> = 'kubernetes.WSLProxy.port' as any;
      this.$store.dispatch('preferences/updatePreferencesData', { property, value });
    },

    castToNumber(val: string): number | null {
      return val ? Number(val) : null;
    },
  }
});
</script>

<style lang="scss" scoped>
  .wsl-proxy {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: grey;
  }
</style>

<template>
  <div class="preferences-body">
    <rd-fieldset
      :legend-text="t('proxy.windows.description', { }, true)"
    >
      <section class="wsl-proxy">
        <h3 v-if="description" v-text="description" />
        <rd-fieldset
          :legend-text="t('proxy.windows.address', { }, true)"
        >
          <input
            :disabled="isProxyDisabled"
            :value="preferences.kubernetes.WSLProxy.address"
            @input="onAddressChange($event.target.value)"
          />
        </rd-fieldset>
        <rd-fieldset
          :legend-text="t('proxy.windows.port', { }, true)"
        >
          <input
            type="number"
            :disabled="isProxyDisabled"
            :value="preferences.kubernetes.WSLProxy.port"
            @input="onPortChange(castToNumber($event.target.value))"
          />
        </rd-fieldset>
      </section>
    </rd-fieldset>
  </div>
</template>
