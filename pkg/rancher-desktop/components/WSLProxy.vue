<script lang="ts">
import { mapGetters } from 'vuex';

import RdFieldset from '@pkg/components/form/RdFieldset.vue';
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
  },

  computed: { 
    ...mapGetters('preferences', {proxy: 'getWslProxy'}),
  },

  components: {
    RdFieldset
  },

  methods: {
    onAddressChange(value: string | null) {
      console.log(value);
      this.$store.dispatch('preferences/updateWslProxy', { address: value });
    },

    onPortChange(value: number | null) {
      this.$store.dispatch('preferences/updateWslProxy', { port: value });
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
 proxy.           :value="proxy.address"
            @input="onAddressChange($event.target.value)"
          />
        </rd-fieldset>
        <rd-fieldset
          :legend-text="t('proxy.windows.port', { }, true)"
        >
          <input
            type="number"
            :disabled="isProxyDisabled"
            :value="proxy.port"
            @input="onPortChange(castToNumber($event.target.value))"
          />
        </rd-fieldset>
      </section>
    </rd-fieldset>
  </div>
</template>
