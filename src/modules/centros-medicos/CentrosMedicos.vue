<template>
  <h1 class="m-5">Centros médicos</h1>
  <Divider />
  <div class="centros-medicos-container">
    <div class="centro-medico-card" v-for="(center, id) in medicCenters" :key="id">
      <Card>
        <template #title>{{ center.name }}</template>
        <template #content>
          <div><strong>Nombre: </strong> {{ center.name }}</div>
          <div><strong>Direccion: </strong> {{ center.direccion }}</div>
        </template>
      </Card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import Divider from 'primevue/divider';

const medicCenters = ref([
  {
    id: 1,
    name: 'Centro Médico A',
    direccion: 'Calle 123, Ciudad A',
  },
  {
    id: 2,
    name: 'Centro Médico B',
    direccion: 'Avenida 456, Ciudad B',
  },
]);
</script>

<style lang="scss">
.centros-medicos-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  height: 100%;
  width: 100%;

  .centro-medico-card {
    display: flex;
    width: 100%;
    height: 100%;

    .p-card {
      box-shadow: 0 10px 9px rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      background-color: var(--gray-50);
      width: 100%;
      justify-content: center;
      height: 100%;
    }

    .p-card-body {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .p-card-caption {
        text-align: center;

        .p-card-title {
          font-weight: 700;
        }
      }

      .p-card-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  }
}
</style>
