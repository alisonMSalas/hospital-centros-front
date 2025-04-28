<template>
  <h1 class="m-5">Consultas Médicas</h1>
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
          <Button label="Agregar" icon="pi pi-plus" @click="openAddModal" />
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
        <Column field="medico.nombre" header="Médico" :showFilterMenu="false" sortable />
        <Column field="paciente.nombre" header="Paciente" :showFilterMenu="false" sortable />
        <Column field="fecha" header="Fecha" :showFilterMenu="false" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.fecha) }}
          </template>
        </Column>
        <Column field="diagnostico" header="Diagnóstico" :showFilterMenu="false" sortable />
        <Column header="Acciones">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              severity="info"
              variant="text"
              @click="openEditModal(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              variant="text"
              @click="openDeleteModal(slotProps.data)"
            />
          </template>
        </Column>
        <template #empty>No se encontraron consultas médicas.</template>
      </DataTable>
    </div>
  </div>

 
  <Dialog
    header="Nueva Consulta Médica"
    v-model:visible="addModalVisible"
    :modal="true"
    :closable="false"
    :dismissable-mask="true"
    :style="{ width: '37vw' }"
    class="custom-dialog"
  >
    <div class="modal-content">
      <div class="inputs">
        <div class="input-group">
          <label for="add-medico"><i class="pi pi-user-md"></i> Médico</label>
          <Select
            id="add-medico"
            v-model="newConsulta.medico_id"
            :options="medicos"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccionar médico"
            filter
            class="custom-select"
          />
        </div>
        <div class="input-group">
          <label for="add-paciente"><i class="pi pi-user"></i> Paciente</label>
          <Select
            id="add-paciente"
            v-model="newConsulta.paciente_id"
            :options="pacientes"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccionar paciente"
            filter
            class="custom-select"
          />
        </div>
        <div class="input-group">
          <label for="add-fecha"><i class="pi pi-calendar"></i> Fecha</label>
          <InputText
            id="add-fecha"
            v-model="newConsulta.fecha"
            type="date"
            :max="today"
            placeholder="Fecha de la consulta"
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <label for="add-diagnostico"><i class="pi pi-file"></i> Diagnóstico</label>
          <Textarea
            id="add-diagnostico"
            v-model="newConsulta.diagnostico"
            placeholder="Describa el diagnóstico"
            rows="4"
            class="custom-textarea"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-outlined p-button-secondary"
        @click="closeAddModal"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        class="p-button-raised p-button-success"
        @click="saveConsulta"
      />
    </template>
  </Dialog>

 
  <Dialog
    header="Editar Consulta Médica"
    v-model:visible="editModalVisible"
    :modal="true"
    :closable="false"
    :dismissable-mask="true"
    :style="{ width: '37vw' }"
    class="custom-dialog"
  >
    <div class="modal-content">
      <div class="inputs">
        <div class="input-group">
          <label for="edit-medico"><i class="pi pi-user-md"></i> Médico</label>
          <Select
            id="edit-medico"
            v-model="editConsulta.medico_id"
            :options="medicos"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccionar médico"
            filter
            class="custom-select"
          />
        </div>
        <div class="input-group">
          <label for="edit-paciente"><i class="pi pi-user"></i> Paciente</label>
          <Select
            id="edit-paciente"
            v-model="editConsulta.paciente_id"
            :options="pacientes"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccionar paciente"
            filter
            class="custom-select"
          />
        </div>
        <div class="input-group">
          <label for="edit-fecha"><i class="pi pi-calendar"></i> Fecha</label>
          <InputText
            id="edit-fecha"
            v-model="editConsulta.fecha"
            type="date"
            :max="today"
            placeholder="Fecha de la consulta"
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <label for="edit-diagnostico"><i class="pi pi-file"></i> Diagnóstico</label>
          <Textarea
            id="edit-diagnostico"
            v-model="editConsulta.diagnostico"
            placeholder="Describa el diagnóstico"
            rows="4"
            class="custom-textarea"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-outlined p-button-secondary"
        @click="closeEditModal"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        class="p-button-raised p-button-success"
        @click="updateConsulta"
      />
    </template>
  </Dialog>


  <Dialog
    header="Confirmar Eliminación de Consulta Médica"
    v-model:visible="deleteModalVisible"
    :modal="true"
    :closable="false"
    :dismissable-mask="true"
    :style="{ width: '40vw' }"
    class="custom-dialog delete-dialog"
  >
    <div class="delete-modal-content">
      <i class="pi pi-exclamation-triangle warning-icon"></i>
      <p class="warning-message">
        ¿Estás seguro de que deseas eliminar esta consulta médica? Esta acción no se puede deshacer.
      </p>
      <div class="consulta-details" v-if="consultaToDelete">
        <h4>Detalles de la Consulta</h4>
        <div class="detail-item">
          <span class="detail-label">Médico:</span>
          <span>{{ consultaToDelete.medico?.nombre || 'No disponible' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Paciente:</span>
          <span>{{ consultaToDelete.paciente?.nombre || 'No disponible' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fecha:</span>
          <span>{{ formatDate(consultaToDelete.fecha) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Diagnóstico:</span>
          <span>{{ consultaToDelete.diagnostico || 'No disponible' }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-outlined p-button-secondary"
        @click="closeDeleteModal"
      />
      <Button
        label="Eliminar"
        icon="pi pi-trash"
        class="p-button-raised p-button-danger"
        @click="deleteConsulta"
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
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import axios from 'axios';
import apiClient from '../services/apiClient';
import { useAppStore } from '@/stores/app-store';
import { useToast } from 'primevue/usetoast'; 

const toast = useToast();

const store = useAppStore();


const today = ref('');
const setToday = () => {
  const now = new Date();
  today.value = now.toISOString().split('T')[0]; 
};

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const deleteFilters = () => {
  filters.value.global.value = null;
};

const consultas = ref([]);
const selectedConsulta = ref();
const addModalVisible = ref(false);
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);
const medicos = ref([]);
const pacientes = ref([]);

const newConsulta = ref({
  medico_id: null,
  paciente_id: null,
  fecha: '',
  diagnostico: '',
  centro_medico_id: Number(store.centro),
});

const editConsulta = ref<{
  id: number | null;
  medico_id: number | null;
  paciente_id: number | null;
  fecha: string;
  diagnostico: string;
  centro_medico_id: number | null;
}>({
  id: null,
  medico_id: null,
  paciente_id: null,
  fecha: '',
  diagnostico: '',
  centro_medico_id: Number(store.centro),
});

const consultaToDelete = ref<{
  id: number | null;
  medico_id: number | null;
  paciente_id: number | null;
  fecha: string;
  diagnostico: string;
  medico?: { nombre: string };
  paciente?: { nombre: string };
} | null>(null);

const formatDate = (date: string | null) => {
  if (!date) return 'No especificada';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return 'No especificada';
  return parsedDate.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const getConsultas = async () => {
  try {
    const response = await apiClient.get('/hospital/consulta-medica');
    consultas.value = response.data;
  } catch (error) {
    console.error('Error al obtener consultas médicas:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al obtener consultas médicas',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al obtener consultas médicas',
        life: 3000
      });
    }
  }
};

const getMedicos = async () => {
  try {
    const response = await apiClient.get('/hospital/medico');
    medicos.value = response.data;
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al obtener médicos',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al obtener médicos',
        life: 3000
      });
    }
  }
};

const getPacientes = async () => {
  try {
    const response = await apiClient.get('/hospital/paciente');
    pacientes.value = response.data;
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al obtener pacientes',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al obtener pacientes',
        life: 3000
      });
    }
  }
};

const openAddModal = () => {
  newConsulta.value = {
    medico_id: null,
    paciente_id: null,
    fecha: '',
    diagnostico: '',
    centro_medico_id: Number(store.centro),
  };
  addModalVisible.value = true;
};

const closeAddModal = () => {
  addModalVisible.value = false;
};

const saveConsulta = async () => {
  if (
    !newConsulta.value.medico_id ||
    !newConsulta.value.paciente_id ||
    !newConsulta.value.fecha ||
    !newConsulta.value.diagnostico ||
    !newConsulta.value.centro_medico_id
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Todos los campos son obligatorios',
      life: 3000
    });
    return;
  }
  const inputDate = new Date(newConsulta.value.fecha);
  const currentDate = new Date();
  if (inputDate > currentDate) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'La fecha de la consulta no puede ser futura',
      life: 3000
    });
    
    return;
  }
  try {
    await apiClient.post('/hospital/consulta-medica', newConsulta.value);
    await getConsultas();
    closeAddModal();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Consulta médica creada exitosamente',
      life: 3000
    });
  } catch (error) {
    console.error('Error al guardar consulta médica:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al guardar consulta médica',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al guardar consulta médica',
        life: 3000
      });
    }
  }
};

const openEditModal = (consulta: {
  id: number;
  medico_id: number;
  paciente_id: number;
  fecha: string;
  diagnostico: string;
  centro_medico_id: number;
}) => {
  editConsulta.value = {
    id: consulta.id,
    medico_id: consulta.medico_id,
    paciente_id: consulta.paciente_id,
    fecha: consulta.fecha ? consulta.fecha.split('T')[0] : '',
    diagnostico: consulta.diagnostico,
    centro_medico_id: Number(store.centro),
  };
  editModalVisible.value = true;
};

const closeEditModal = () => {
  editModalVisible.value = false;
};

const updateConsulta = async () => {
  if (
    !editConsulta.value.medico_id ||
    !editConsulta.value.paciente_id ||
    !editConsulta.value.fecha ||
    !editConsulta.value.diagnostico ||
    !editConsulta.value.centro_medico_id
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Todos los campos son obligatorios',
      life: 3000
    });
    return;
  }
  const inputDate = new Date(editConsulta.value.fecha);
  const currentDate = new Date();
  if (inputDate > currentDate) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'La fecha de la consulta no puede ser futura',
      life: 3000
    });
    return;
  }
  try {
    await apiClient.put(`/hospital/consulta-medica/${editConsulta.value.id}`, editConsulta.value);
    await getConsultas();
    closeEditModal();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Consulta médica actualizada exitosamente',
      life: 3000
    });
  } catch (error) {
    console.error('Error al actualizar consulta médica:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al actualizar consulta médica',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar consulta médica',
        life: 3000
      });
    }
  }
};

const openDeleteModal = (consulta: {
  id: number;
  medico_id: number;
  paciente_id: number;
  fecha: string;
  diagnostico: string;
  medico: { nombre: string };
  paciente: { nombre: string };
}) => {
  consultaToDelete.value = consulta;
  deleteModalVisible.value = true;
};

const closeDeleteModal = () => {
  deleteModalVisible.value = false;
  consultaToDelete.value = null;
};

const deleteConsulta = async () => {
  try {
    if (consultaToDelete.value?.id) {
      await apiClient.delete(`/hospital/consulta-medica/${consultaToDelete.value.id}`);
      await getConsultas();
      closeDeleteModal();
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Consulta médica eliminada exitosamente',
        life: 3000
      });
    }
  } catch (error) {
    console.error('Error al eliminar consulta médica:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al eliminar consulta médica',
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar consulta médica',
        life: 3000
      });
    }
  }
};

onMounted(() => {
  setToday();
  getConsultas();
  getMedicos();
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
  gap: 1rem;
}

.inputs input,
.inputs .p-select,
.inputs .p-textarea {
  width: 100%;
}


:deep(.custom-dialog) {
  .p-dialog-header {
    background: #ffffff;
    color: #2c3e50;
    font-weight: 600;
    border-bottom: 1px solid #e2e8f0;
    padding: 1rem;
  }

  .p-dialog-content {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .p-dialog-footer {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    background: #ffffff;
    border-top: 1px solid #e2e8f0;

    .p-button {
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-weight: 500;
      transition: background-color 0.2s, transform 0.2s;

      &.p-button-success {
        background: #28a745;
        border-color: #28a745;

        &:hover {
          background: #218838;
          transform: translateY(-1px);
        }
      }

      &.p-button-secondary {
        color: #6c757d;
        border-color: #6c757d;

        &:hover {
          background: #f1f3f5;
          transform: translateY(-1px);
        }
      }

      &.p-button-danger {
        background: #dc3545;
        border-color: #dc3545;

        &:hover {
          background: #c82333;
          transform: translateY(-1px);
        }
      }
    }
  }
}


.modal-content {
  .inputs {
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 500;
        color: #2c3e50;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;

        i {
          color: #3498db;
          font-size: 1rem;
        }
      }

      .custom-input,
      .custom-select,
      .custom-textarea {
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 0.5rem;
        font-size: 0.9rem;
        background: #ffffff;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          border-color: #3498db;
          box-shadow: 0 0 5px rgba(52, 152, 219, 0.2);
          outline: none;
        }
      }

      .custom-textarea {
        height: 100px;
        resize: none;
      }
    }
  }
}


.delete-dialog {
  .delete-modal-content {
    text-align: center;

    .warning-icon {
      color: #dc3545;
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .warning-message {
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
    }

    .consulta-details {
      background: #fff;
      border: 1px solid #d1e0ee;
      border-radius: 6px;
      padding: 1rem;
      text-align: left;
      margin-bottom: 1.5rem;

      h4 {
        color: #2c3e50;
        font-size: 1.1rem;
        margin-bottom: 1rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e9ecef;

        &:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 500;
          color: #4a5568;
        }

        span {
          color: #2c3e50;
        }
      }
    }
  }
}
</style>