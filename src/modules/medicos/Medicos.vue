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
          <Button label="Agregar" icon="pi pi-plus" @click="openAddModal" />
        </div>
      </div>

      <DataTable
        :value="medicos"
        v-model:filters="filters"
        v-model:selection="selectedMedico"
        :rows="5"
        paginator
        removableSort
        :globalFilterFields="['nombre', 'especialidad.nombre', 'centroMedico.nombre']"
        tableStyle="min-width: 50rem"
      >
        <Column field="nombre" header="Nombre" :showFilterMenu="false" sortable>
          <template #filter>
            <InputText v-model="filters.nombre.value" placeholder="Buscar por nombre" />
          </template>
        </Column>
        <Column field="especialidad.nombre" header="Especialidad" :showFilterMenu="false" sortable>
          <template #filter>
            <Select
              v-model="filters.especialidad.value"
              :options="especialidades"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Buscar por especialidad"
              filter
            />
          </template>
        </Column>
        <Column field="centroMedico.nombre" header="Centro Médico" :showFilterMenu="false" sortable>
          <template #filter>
            <Select
              v-model="filters.centroMedico.value"
              :options="centrosMedicos"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Buscar por centro médico"
              filter
            />
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
        <template #empty>No se encontraron médicos.</template>
      </DataTable>
    </div>
  </div>

  <!-- Modal para agregar un nuevo médico -->
  <Dialog
    header="Crear Médico"
    v-model:visible="addModalVisible"
    :modal="true"
    :closable="false"
    :dismissable-mask="true"
    :style="{ width: '37vw' }"
  >
    <div class="inputs">
      <InputText v-model="newMedico.nombre" placeholder="Nombre del médico" />
      <Select
        v-model="newMedico.especialidad_id"
        :options="especialidades"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Seleccionar especialidad"
        filter
      />
      <Select
        v-model="newMedico.centro_medico_id"
        :options="centrosMedicos"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Seleccionar centro médico"
        filter
      />
    </div>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="closeAddModal" />
      <Button label="Guardar" icon="pi pi-check" @click="saveMedico" />
    </template>
  </Dialog>

  <!-- Modal para editar un médico -->
  <Dialog
    header="Editar Médico"
    v-model:visible="editModalVisible"
    :modal="true"
    :closable="false"
    :dismissable-mask="true"
    :style="{ width: '37vw' }"
  >
    <div class="inputs">
      <InputText v-model="editMedico.nombre" placeholder="Nombre del médico" />
      <Select
        v-model="editMedico.especialidad_id"
        :options="especialidades"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Seleccionar especialidad"
        filter
      />
      <Select
        v-model="editMedico.centro_medico_id"
        :options="centrosMedicos"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Seleccionar centro médico"
        filter
      />
    </div>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="closeEditModal" />
      <Button label="Guardar" icon="pi pi-check" @click="updateMedico" />
    </template>
  </Dialog>

  <!-- Modal para confirmar eliminación -->
  <Dialog
    header="Confirmar Eliminación"
    v-model:visible="deleteModalVisible"
    :modal="true"
    :closable="false"
    :dismissable-mask="true"
    :style="{ width: '37vw' }"
  >
    <p>¿Estás seguro de que deseas eliminar al médico {{ medicoToDelete?.nombre }}?</p>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" @click="closeDeleteModal" />
      <Button label="Eliminar" icon="pi pi-trash" severity="danger" @click="deleteMedico" />
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
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  especialidad: { value: null, matchMode: FilterMatchMode.EQUALS },
  centroMedico: { value: null, matchMode: FilterMatchMode.EQUALS },
});

// Limpiar filtros
const deleteFilters = () => {
  filters.value.global.value = null;
  filters.value.nombre.value = null;
  filters.value.especialidad.value = null;
  filters.value.centroMedico.value = null;
};

// Estado para médicos
const medicos = ref([]);
const selectedMedico = ref();
const addModalVisible = ref(false);
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);

const newMedico = ref({ nombre: '', especialidad_id: null, centro_medico_id: null });
const editMedico = ref<{ id: number | null; nombre: string; especialidad_id: number | null; centro_medico_id: number | null }>({
  id: null,
  nombre: '',
  especialidad_id: null,
  centro_medico_id: null,
});
const medicoToDelete = ref<{ id: number | null; nombre: string } | null>(null);

// Listas para especialidades y centros médicos
const especialidades = ref([]);
const centrosMedicos = ref([]);

// Obtener especialidades
const getEspecialidades = async () => {
  try {
    const response = await apiClient.get('/admin/especialidades');
    especialidades.value = response.data;
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    alert('Error al cargar especialidades');
  }
};

// Obtener centros médicos
const getCentrosMedicos = async () => {
  try {
    const response = await apiClient.get('/admin/centros-medicos');
    centrosMedicos.value = response.data;
  } catch (error) {
    console.error('Error al obtener centros médicos:', error);
    alert('Error al cargar centros médicos');
  }
};

// Obtener médicos
const getMedicos = async () => {
  try {
    const response = await apiClient.get('/admin/medicos');
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

// Abrir modal para agregar
const openAddModal = () => {
  newMedico.value = { nombre: '', especialidad_id: null, centro_medico_id: null };
  addModalVisible.value = true;
};

// Cerrar modal para agregar
const closeAddModal = () => {
  addModalVisible.value = false;
};

// Guardar nuevo médico
const saveMedico = async () => {
  if (!newMedico.value.nombre || !newMedico.value.especialidad_id || !newMedico.value.centro_medico_id) {
    alert('Todos los campos son obligatorios');
    return;
  }
  try {
    await apiClient.post('/admin/medicos', newMedico.value);
    await getMedicos(); // Refrescar la lista
    closeAddModal();
    alert('Médico creado exitosamente');
  } catch (error) {
    console.error('Error al guardar médico:', error);
    if (axios.isAxiosError(error)) {
      alert(error.response?.data?.message || 'Error al guardar médico');
    } else {
      alert('Error al guardar médico');
    }
  }
};

// Abrir modal para editar
const openEditModal = (medico: {
  id: number;
  nombre: string;
  especialidad: { id: number };
  centroMedico: { id: number };
}) => {
  editMedico.value = {
    id: medico.id,
    nombre: medico.nombre,
    especialidad_id: medico.especialidad.id,
    centro_medico_id: medico.centroMedico.id,
  };
  editModalVisible.value = true;
};

// Cerrar modal para editar
const closeEditModal = () => {
  editModalVisible.value = false;
};

// Actualizar médico
const updateMedico = async () => {
  if (!editMedico.value.nombre || !editMedico.value.especialidad_id || !editMedico.value.centro_medico_id) {
    alert('Todos los campos son obligatorios');
    return;
  }
  try {
    await apiClient.put(`/admin/medicos/${editMedico.value.id}`, editMedico.value);
    await getMedicos(); // Refrescar la lista
    closeEditModal();
    alert('Médico actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar médico:', error);
    if (axios.isAxiosError(error)) {
      alert(error.response?.data?.message || 'Error al actualizar médico');
    } else {
      alert('Error al actualizar médico');
    }
  }
};

// Abrir modal para eliminar
const openDeleteModal = (medico: { id: number; nombre: string }) => {
  medicoToDelete.value = medico;
  deleteModalVisible.value = true;
};

// Cerrar modal para eliminar
const closeDeleteModal = () => {
  deleteModalVisible.value = false;
  medicoToDelete.value = null;
};

// Eliminar médico
const deleteMedico = async () => {
  try {
    if (medicoToDelete.value) {
      await apiClient.delete(`/admin/medicos/${medicoToDelete.value.id}`);
    }
    await getMedicos(); // Refrescar la lista
    closeDeleteModal();
    alert('Médico eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar médico:', error);
    if (axios.isAxiosError(error)) {
      alert(error.response?.data?.message || 'Error al eliminar médico');
    } else {
      alert('Error al eliminar médico');
    }
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  getMedicos();
  getEspecialidades();
  getCentrosMedicos();
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