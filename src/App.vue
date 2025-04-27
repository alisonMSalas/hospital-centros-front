<template>
  <MenuBar v-if="showMenu" />
  <div class="content">
    <router-view />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import MenuBar from './shared/components/MenuBar.vue';
import { useRoute } from 'vue-router';
import { useAppStore } from './stores/app-store';

const route = useRoute();
const store = useAppStore();

const showMenu = computed(() => {
  return store.token !== '' && route.name !== 'login';
});
</script>
