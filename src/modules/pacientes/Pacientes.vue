<template>
  <h1 class="m-5">Pacientes</h1>
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
        <Column field="fechaNacimiento" header="Fecha de Nacimiento" :showFilterMenu="false" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.fechaNacimiento) }}
          </template>
        </Column>
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
        <template #empty>No se encontraron pacientes.</template>
      </DataTable>
    </div>
  </div>


  <Dialog
    header="Crear Paciente"
    v-model:visible="addModalVisible"
    :modal="true"
    :closable="false"
    :dismissable-mask="true"
    :style="{ width: '37vw' }"
  >
    <div class="inputs">
      <InputText v-model="newPaciente.cedula" placeholder="Cédula" />
      <InputText v-model="newPaciente.nombre" placeholder="Nombre del paciente" />
      <InputText v-model="newPaciente.fechaNacimiento" type="date" max="today" placeholder="Fecha de nacimiento" />
    </div>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="closeAddModal" />
      <Button label="Guardar" icon="pi pi-check" @click="savePaciente" />
    </template>
  </Dialog>


  <Dialog
    header="Editar Paciente"
    v-model:visible="editModalVisible"
    :modal="true"
    :closable="false"
    :dismissable-mask="true"
    :style="{ width: '37vw' }"
  >

    <div class="inputs">
      <InputText v-model="editPaciente.cedula" placeholder="Cédula" />
      <InputText v-model="editPaciente.nombre" placeholder="Nombre del paciente" />
      <InputText v-model="editPaciente.fechaNacimiento" type="date" max="today" placeholder="Fecha de nacimiento" />
    </div>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="closeEditModal" />
      <Button label="Guardar" icon="pi pi-check" @click="updatePaciente" />
    </template>
  </Dialog>


  <Dialog
    header="Confirmar Eliminación"
    v-model:visible="deleteModalVisible"
    :modal="true"
    :closable="false"
    :dismissable-mask="true"
    :style="{ width: '37vw' }"
  >
    <p>¿Estás seguro de que deseas eliminar al paciente {{ pacienteToDelete?.nombre }}?</p>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="closeDeleteModal" />
      <Button label="Eliminar" icon="pi pi-trash" severity="danger" @click="deletePaciente" />
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
import axios from 'axios';
import apiClient from '../services/apiClient';
import { useAppStore } from '@/stores/app-store';
import { useToast } from 'primevue/usetoast'; 

const toast = useToast();

const store = useAppStore();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const deleteFilters = () => {
  filters.value.global.value = null;
};

const pacientes = ref([]);
const selectedPaciente = ref();
const addModalVisible = ref(false);
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);

const newPaciente = ref({
  cedula: '',
  nombre: '',
  fechaNacimiento: '',
  centroMedicoId: Number(store.centro),
});

const editPaciente = ref<{
  id: number | null;
  cedula: string;
  nombre: string;
  fechaNacimiento: string;
  centroMedicoId: number | null;
}>({
  id: null,
  cedula: '',
  nombre: '',
  fechaNacimiento: '',
  centroMedicoId: Number(store.centro),
});

const pacienteToDelete = ref<{ id: number | null; nombre: string } | null>(null);
const centrosMedicos = ref([]);

const formatDate = (date: string | null) => {
  if (!date) return 'No especificada';
  return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
        life: 3000,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al obtener pacientes',
        life: 3000,
      });
      
    }
  }
};

const openAddModal = () => {
  newPaciente.value = { cedula: '', nombre: '', fechaNacimiento: '', centroMedicoId: Number(store.centro) };
  addModalVisible.value = true;
};

const closeAddModal = () => {
  addModalVisible.value = false;
};

const savePaciente = async () => {
  if (
    !newPaciente.value.cedula ||
    !newPaciente.value.nombre ||
    !newPaciente.value.fechaNacimiento ||
    !newPaciente.value.centroMedicoId
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Todos los campos son obligatorios',
      life: 3000,
    });
    return;
  }
  try {
    await apiClient.post('/hospital/paciente', newPaciente.value);
    await getPacientes();
    closeAddModal();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Paciente creado exitosamente',
      life: 3000,
    });
  } catch (error) {
    console.error('Error al guardar paciente:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al guardar paciente',
        life: 3000,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al guardar paciente',
        life: 3000,
      });
    }
  }
};

const openEditModal = (paciente: {
  id: number;
  cedula: string;
  nombre: string;
  fechaNacimiento: string;
  centroMedicoId: number | null;
}) => {
  editPaciente.value = {
    id: paciente.id,
    cedula: paciente.cedula,
    nombre: paciente.nombre,
    fechaNacimiento: paciente.fechaNacimiento.toString().split('T')[0],
    centroMedicoId: paciente.centroMedicoId,
  };
  editModalVisible.value = true;
};

const closeEditModal = () => {
  editModalVisible.value = false;
};

const updatePaciente = async () => {
  editPaciente.value.centroMedicoId = Number(store.centro)
  if (
    !editPaciente.value.cedula ||
    !editPaciente.value.nombre ||
    !editPaciente.value.fechaNacimiento ||
    !editPaciente.value.centroMedicoId
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Todos los campos son obligatorios',
      life: 3000,
    });
    return;
  }
  try {
    await apiClient.put(`/hospital/paciente/${editPaciente.value.id}`, editPaciente.value);
    await getPacientes();
    closeEditModal();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Paciente actualizado exitosamente',
      life: 3000,
    });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al actualizar paciente',
        life: 3000,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar paciente',
        life: 3000,
      });
    }
  }
};

const openDeleteModal = (paciente: { id: number; nombre: string }) => {
  pacienteToDelete.value = paciente;
  deleteModalVisible.value = true;
};

const closeDeleteModal = () => {
  deleteModalVisible.value = false;
  pacienteToDelete.value = null;
};

const deletePaciente = async () => {
  try {
    if (pacienteToDelete.value) {
      await apiClient.delete(`/hospital/paciente/${pacienteToDelete.value.id}`);
    }
    await getPacientes();
    closeDeleteModal();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Paciente eliminado exitosamente',
      life: 3000,
    });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al eliminar paciente',
        life: 3000,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar paciente',
        life: 3000,
      });
    }
  }
};

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
  width: fit-content;

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