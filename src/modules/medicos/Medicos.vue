<template>
  <h1 class="m-5">Médicos</h1>
  <Divider />
  <div class="container">
    <div class="table-container">
      <div class="actions">
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filters.global.value" placeholder="Búsqueda general" />
        </IconField>
        <div class="buttons">
          <Button
            label="Eliminar filtros"
            icon="pi pi-times"
            variant="text"
            severity="info"
            @click="deleteFilters()"
          />
        </div>
      </div>

      <DataTable
        :value="medicos"
        v-model:filters="filters"
        v-model:selection="selectedMedico"
        :rows="5"
        paginator
        removableSort
        :globalFilterFields="['nombre', 'especialidad.nombre']"
        tableStyle="min-width: 50rem"
      >
        <Column field="nombre" header="Nombre" :showFilterMenu="false" sortable />
        <Column field="especialidad.nombre" header="Especialidad" :showFilterMenu="false" sortable />
        <template #empty>No se encontraron médicos.</template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Divider from 'primevue/divider';
import DataTable from 'primevue/datatable';
import { FilterMatchMode } from '@primevue/core/api';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import apiClient from '../services/apiClient';
import axios from 'axios';

// Estado para filtros
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Limpiar filtros
const deleteFilters = () => {
  filters.value.global.value = null;
};

// Estado para médicos
const medicos = ref([]);
const selectedMedico = ref();

// Obtener médicos
const getMedicos = async () => {
  try {
    const response = await apiClient.get('/hospital/medico');
    medicos.value = response.data;
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    if (axios.isAxiosError(error)) {
      alert(error.response?.data?.message || 'Error al obtener médicos');
    } else {
      alert('Error al obtener médicos');
    }
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  getMedicos();
});
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;

  .table-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
    width: 100%;

    .actions {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 1rem;

      .buttons {
        display: flex;
        gap: 1rem;
      }
    }

    .p-datatable-inline-filter {
      width: fit-content;

      .p-datatable-filter-element-container {
        flex: none;
        width: fit-content;
      }
    }
  }
}
</style>