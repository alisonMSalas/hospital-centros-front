<template>
    <h1 class="m-5">Pacientes</h1>
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
          :value="pacientes"
          v-model:filters="filters"
          v-model:selection="selectedPaciente"
          :rows="5"
          paginator
          removableSort
          :globalFilterFields="['cedula', 'nombre', 'centroMedico.nombre']"
          tableStyle="min-width: 50rem"
        >
          <Column field="cedula" header="Cédula" :showFilterMenu="false" sortable />
          <Column field="nombre" header="Nombre" :showFilterMenu="false" sortable />
          <Column field="fecha_nacimiento" header="Fecha de Nacimiento" :showFilterMenu="false" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.fecha_nacimiento) }}
            </template>
          </Column>
          <Column field="centroMedico.nombre" header="Centro Médico" :showFilterMenu="false" sortable />
          <template #empty>No se encontraron pacientes.</template>
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
  import { useAppStore } from '@/stores/app-store';
  
  const store = useAppStore();
  const apiUrl = store.apiUrl;
  
  const apiClient = axios.create({
    baseURL: apiUrl, 
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });
  
  apiClient.interceptors.request.use((config) => {
    const token = store.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  // Estado para filtros
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  
  // Limpiar filtros
  const deleteFilters = () => {
    filters.value.global.value = null;
  };
  
  // Estado para pacientes
  const pacientes = ref([]);
  const selectedPaciente = ref();
  
  // Formatear fecha para mostrar en la tabla
  const formatDate = (date: string | null) => {
    if (!date) return 'No especificada';
    return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  
  // Obtener pacientes
  const getPacientes = async () => {
    try {
      const response = await apiClient.get('/admin/pacientes');
      pacientes.value = response.data;
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Error al obtener pacientes');
      } else {
        alert('Error al obtener pacientes');
      }
    }
  };
  
  // Cargar datos al montar el componente
  onMounted(() => {
    getPacientes();
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
  
  .inputs {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .inputs input,
  .inputs .p-select {
    width: 100%;
  }
  </style>