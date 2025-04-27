<template>
    <h1 class="m-5">Consultas Médicas</h1>
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
          :value="consultas"
          v-model:filters="filters"
          v-model:selection="selectedConsulta"
          :rows="5"
          paginator
          removableSort
          :globalFilterFields="['medico.nombre', 'paciente.nombre', 'diagnostico']"
          tableStyle="min-width: 50rem"
        >
          <Column field="paciente.nombre" header="Paciente" :showFilterMenu="false" sortable />
          <Column field="medico.nombre" header="Médico" :showFilterMenu="false" sortable />
          <Column field="fecha" header="Fecha" :showFilterMenu="false" sortable>
            <template #body="slotProps">
              {{ formatDate(slotProps.data.fecha) }}
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <Button
                icon="pi pi-eye"
                severity="info"
                variant="text"
                @click="openViewModal(slotProps.data)"
              />
            </template>
          </Column>
          <template #empty>No se encontraron consultas médicas.</template>
        </DataTable>
      </div>
    </div>
  
    <!-- Modal para ver detalles de la consulta médica -->
    <Dialog
      header="Detalles de la Consulta Médica"
      v-model:visible="viewModalVisible"
      :modal="true"
      :closable="false"
      :dismissable-mask="true"
      :style="{ width: '40vw' }"
      class="custom-dialog"
    >
      <div class="details-card">
        
        <div class="detail-item">
          <i class="pi pi-user detail-icon" />
          <div>
            <span class="detail-label">Paciente</span>
            <p class="detail-value">{{ viewConsulta?.paciente.nombre }}</p>
          </div>
        </div>
        <div class="detail-item">
          <i class="pi pi-user-plus detail-icon" />
          <div>
            <span class="detail-label">Médico</span>
            <p class="detail-value">{{ viewConsulta?.medico.nombre }}</p>
          </div>
        </div>
        <div class="detail-item">
          <i class="pi pi-calendar detail-icon" />
          <div>
            <span class="detail-label">Fecha</span>
            <p class="detail-value">{{ formatDate(viewConsulta!?.fecha) }}</p>
          </div>
        </div>
        <div class="detail-item">
          <i class="pi pi-file detail-icon" />
          <div>
            <span class="detail-label">Diagnóstico</span>
            <p class="detail-value">{{ viewConsulta?.diagnostico }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          label="Cerrar"
          icon="pi pi-times"
          class="p-button-rounded p-button-info"
          @click="closeViewModal"
        />
      </template>
    </Dialog>
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
  import Dialog from 'primevue/dialog';
  import axios from 'axios';
  import { useAppStore } from '@/stores/app-store';
  
  const store = useAppStore();
  const apiUrl = store.apiUrl;
  
  // Configuración de axios con interceptor para JWT
  const apiClient = axios.create({
    baseURL: apiUrl, // URL del API Gateway (por ejemplo, http://localhost:3000/api)
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
  
  // Estado para consultas médicas
  const consultas = ref([]);
  const selectedConsulta = ref();
  const viewModalVisible = ref(false);
  const viewConsulta = ref<{
    id: number;
    medico: { nombre: string };
    paciente: { nombre: string };
    fecha: string;
    diagnostico: string;
  } | null>(null);
  
  // Formatear fecha para mostrar en la tabla y modal
  const formatDate = (date: string | null) => {
    if (!date) return 'No especificada';
    return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  
  // Obtener consultas médicas
  const getConsultas = async () => {
    try {
      const response = await apiClient.get('/admin/consultas-medicas');
      consultas.value = response.data;
    } catch (error) {
      console.error('Error al obtener consultas médicas:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Error al obtener consultas médicas');
      } else {
        alert('Error al obtener consultas médicas');
      }
    }
  };
  
  // Abrir modal para ver detalles
  const openViewModal = (consulta: {
    id: number;
    medico: { nombre: string };
    paciente: { nombre: string };
    fecha: string;
    diagnostico: string;
  }) => {
    viewConsulta.value = consulta;
    viewModalVisible.value = true;
  };
  
  // Cerrar modal de ver detalles
  const closeViewModal = () => {
    viewModalVisible.value = false;
    viewConsulta.value = null;
  };
  
  // Cargar datos al montar el componente
  onMounted(() => {
    getConsultas();
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
  
  /* Estilos mejorados para el modal */
  .custom-dialog {
    .p-dialog-header {
      background: linear-gradient(90deg, #0288d1 0%, #4fc3f7 100%);
      color: white;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      padding: 1.5rem;
      font-size: 1.25rem;
      font-weight: 600;
    }
  
    .p-dialog-content {
      background: #f5f7fa;
      padding: 2rem;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }
  }
  
  .details-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .detail-icon {
    font-size: 1.5rem;
    color: #0288d1;
  }
  
  .detail-label {
    display: block;
    font-size: 0.9rem;
    color: #546e7a;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }
  
  .detail-value {
    margin: 0;
    font-size: 1.1rem;
    color: #263238;
    font-weight: 500;
  }
  </style>