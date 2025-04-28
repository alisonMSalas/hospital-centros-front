<template>
  <h1 class="m-5">Especialidades</h1>
  <Divider />
  <Toast />
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
        :value="especialidades"
        v-model:filters="filters"
        v-model:selection="selectedEspecialidad"
        :rows="5"
        paginator
        removableSort
        :globalFilterFields="['nombre']"
        tableStyle="min-width: 50rem"
      >
        <Column field="nombre" header="Nombre" :showFilterMenu="false" sortable />
        <template #empty>No se encontraron especialidades.</template>
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
import axios from 'axios';
import apiClient from '../services/apiClient';
import { useAppStore } from '@/stores/app-store';
import { useToast } from 'primevue/usetoast'; 

const toast = useToast();

const store = useAppStore();
const apiUrl = store.apiUrl;

const apiClientInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  },
});

apiClientInstance.interceptors.request.use((config) => {
  const token = store.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});


const deleteFilters = () => {
  filters.value.global.value = null;
};


const especialidades = ref([]);
const selectedEspecialidad = ref();


const getEspecialidades = async () => {
  try {
    const response = await apiClientInstance.get('/hospital/especialidad');
    especialidades.value = response.data;
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al obtener especialidades',
        life: 3000,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al obtener especialidades',
        life: 3000,
      });
    }
  }
};

// Cargar especialidades al montar el componente
onMounted(() => {
  getEspecialidades();
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