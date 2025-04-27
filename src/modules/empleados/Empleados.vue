<template>
    <h1 class="m-5">Empleados</h1>
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
          :value="empleados"
          v-model:filters="filters"
          v-model:selection="selectedEmpleado"
          :rows="5"
          paginator
          removableSort
          :globalFilterFields="['nombre', 'cargo', 'centroMedico.nombre']"
          tableStyle="min-width: 50rem"
        >
          <Column field="nombre" header="Nombre" :showFilterMenu="false" sortable>
            <template #filter>
              <InputText v-model="filters.nombre.value" placeholder="Buscar por nombre" />
            </template>
          </Column>
          <Column field="cargo" header="Cargo" :showFilterMenu="false" sortable>
            <template #filter>
              <InputText v-model="filters.cargo.value" placeholder="Buscar por cargo" />
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
          <template #empty>No se encontraron empleados.</template>
        </DataTable>
      </div>
    </div>
  
    <!-- Modal para agregar un nuevo empleado -->
    <Dialog
      header="Crear Empleado"
      v-model:visible="addModalVisible"
      :modal="true"
      :closable="false"
      :dismissable-mask="true"
      :style="{ width: '37vw' }"
    >
      <div class="inputs">
        <InputText v-model="newEmpleado.nombre" placeholder="Nombre del empleado" />
        <InputText v-model="newEmpleado.cargo" placeholder="Cargo (opcional)" />
        <Select
          v-model="newEmpleado.centro_medico_id"
          :options="centrosMedicos"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccionar centro médico"
          filter
        />
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeAddModal" />
        <Button label="Guardar" icon="pi pi-check" @click="saveEmpleado" />
      </template>
    </Dialog>
  
    <!-- Modal para editar un empleado -->
    <Dialog
      header="Editar Empleado"
      v-model:visible="editModalVisible"
      :modal="true"
      :closable="false"
      :dismissable-mask="true"
      :style="{ width: '37vw' }"
    >
      <div class="inputs">
        <InputText v-model="editEmpleado.nombre" placeholder="Nombre del empleado" />
        <InputText v-model="editEmpleado.cargo" placeholder="Cargo (opcional)" />
        <Select
          v-model="editEmpleado.centro_medico_id"
          :options="centrosMedicos"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccionar centro médico"
          filter
        />
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeEditModal" />
        <Button label="Guardar" icon="pi pi-check" @click="updateEmpleado" />
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
      <p>¿Estás seguro de que deseas eliminar al empleado {{ empleadoToDelete?.nombre }}?</p>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeDeleteModal" />
        <Button label="Eliminar" icon="pi pi-trash" severity="danger" @click="deleteEmpleado" />
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
    nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cargo: { value: null, matchMode: FilterMatchMode.CONTAINS },
    centroMedico: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  
  // Limpiar filtros
  const deleteFilters = () => {
    filters.value.global.value = null;
    filters.value.nombre.value = null;
    filters.value.cargo.value = null;
    filters.value.centroMedico.value = null;
  };
  
  // Estado para empleados
  const empleados = ref([]);
  const selectedEmpleado = ref();
  const addModalVisible = ref(false);
  const editModalVisible = ref(false);
  const deleteModalVisible = ref(false);
  
  const newEmpleado = ref<{ nombre: string; cargo: string; centro_medico_id: number | null }>({ nombre: '', cargo: '', centro_medico_id: null });
  const editEmpleado = ref<{ id: number | null; nombre: string; cargo: string; centro_medico_id: number | null }>({ id: null, nombre: '', cargo: '', centro_medico_id: null });
  const empleadoToDelete = ref<{ id: number | null; nombre: string } | null>(null);
  
  // Lista para centros médicos
  const centrosMedicos = ref([]);
  
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
  
  // Obtener empleados
  const getEmpleados = async () => {
    try {
      const response = await apiClient.get('/admin/empleados');
      empleados.value = response.data;
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Error al obtener empleados');
      } else {
        alert('Error al obtener empleados');
      }
    }
  };
  
  // Abrir modal para agregar
  const openAddModal = () => {
    newEmpleado.value = { nombre: '', cargo: '', centro_medico_id: null };
    addModalVisible.value = true;
  };
  
  // Cerrar modal para agregar
  const closeAddModal = () => {
    addModalVisible.value = false;
  };
  
  // Guardar nuevo empleado
  const saveEmpleado = async () => {
    if (!newEmpleado.value.nombre || !newEmpleado.value.centro_medico_id) {
      alert('El nombre y el centro médico son obligatorios');
      return;
    }
    try {
      const payload = {
        nombre: newEmpleado.value.nombre,
        cargo: newEmpleado.value.cargo || null, // Enviar null si cargo está vacío
        centro_medico_id: newEmpleado.value.centro_medico_id,
      };
      await apiClient.post('/admin/empleados', payload);
      await getEmpleados(); // Refrescar la lista
      closeAddModal();
      alert('Empleado creado exitosamente');
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Error al guardar empleado');
      } else {
        alert('Error al guardar empleado');
      }
    }
  };
  
  // Abrir modal para editar
  const openEditModal = (empleado: {
    id: number;
    nombre: string;
    cargo: string | null;
    centroMedico: { id: number };
  }) => {
    editEmpleado.value = {
      id: empleado.id,
      nombre: empleado.nombre,
      cargo: empleado.cargo || '',
      centro_medico_id: empleado.centroMedico.id,
    };
    editModalVisible.value = true;
  };
  
  // Cerrar modal para editar
  const closeEditModal = () => {
    editModalVisible.value = false;
  };
  
  // Actualizar empleado
  const updateEmpleado = async () => {
    if (!editEmpleado.value.nombre || !editEmpleado.value.centro_medico_id) {
      alert('El nombre y el centro médico son obligatorios');
      return;
    }
    try {
      const payload = {
        nombre: editEmpleado.value.nombre,
        cargo: editEmpleado.value.cargo || null, // Enviar null si cargo está vacío
        centro_medico_id: editEmpleado.value.centro_medico_id,
      };
      await apiClient.put(`/admin/empleados/${editEmpleado.value.id}`, payload);
      await getEmpleados(); // Refrescar la lista
      closeEditModal();
      alert('Empleado actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Error al actualizar empleado');
      } else {
        alert('Error al actualizar empleado');
      }
    }
  };
  
  // Abrir modal para eliminar
  const openDeleteModal = (empleado: { id: number; nombre: string }) => {
    empleadoToDelete.value = empleado;
    deleteModalVisible.value = true;
  };
  
  // Cerrar modal para eliminar
  const closeDeleteModal = () => {
    deleteModalVisible.value = false;
    empleadoToDelete.value = null;
  };
  
  // Eliminar empleado
  const deleteEmpleado = async () => {
    try {
      if (empleadoToDelete.value) {
        await apiClient.delete(`/admin/empleados/${empleadoToDelete.value.id}`);
      }
      await getEmpleados(); // Refrescar la lista
      closeDeleteModal();
      alert('Empleado eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Error al eliminar empleado');
      } else {
        alert('Error al eliminar empleado');
      }
    }
  };
  
  // Cargar datos al montar el componente
  onMounted(() => {
    getEmpleados();
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