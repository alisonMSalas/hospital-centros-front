<template>
    <h1 class="m-5">Especialidades</h1>
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
          :value="especialidades"
          v-model:filters="filters"
          v-model:selection="selectedEspecialidad"
          :rows="5"
          paginator
          removableSort
          tableStyle="min-width: 50rem"
        >
          <Column field="nombre" header="Nombre" :showFilterMenu="false" sortable />
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
          <template #empty>No se encontraron especialidades.</template>
        </DataTable>
      </div>
    </div>
  
    <!-- Modal para agregar una nueva especialidad -->
    <Dialog
      header="Crear Especialidad"
      v-model:visible="addModalVisible"
      :modal="true"
      :closable="false"
      :dismissable-mask="true"
      :style="{ width: '37vw' }"
    >
      <div class="inputs">
        <InputText v-model="newEspecialidad.nombre" placeholder="Nombre de la especialidad" />
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeAddModal" />
        <Button label="Guardar" icon="pi pi-check" @click="saveEspecialidad" />
      </template>
    </Dialog>
  
    <!-- Modal para editar una especialidad -->
    <Dialog
      header="Editar Especialidad"
      v-model:visible="editModalVisible"
      :modal="true"
      :closable="false"
      :dismissable-mask="true"
      :style="{ width: '37vw' }"
    >
      <div class="inputs">
        <InputText v-model="editEspecialidad.nombre" placeholder="Nombre de la especialidad" />
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeEditModal" />
        <Button label="Guardar" icon="pi pi-check" @click="updateEspecialidad" />
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
      <p>¿Estás seguro de que deseas eliminar la especialidad {{ especialidadToDelete?.nombre }}?</p>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeDeleteModal" />
        <Button label="Eliminar" icon="pi pi-trash" severity="danger" @click="deleteEspecialidad" />
      </template>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import Divider from "primevue/divider";
  import DataTable from "primevue/datatable";
  import { FilterMatchMode } from "@primevue/core/api";
  import Column from "primevue/column";
  import Button from "primevue/button";
  import InputText from "primevue/inputtext";
  import IconField from "primevue/iconfield";
  import InputIcon from "primevue/inputicon";
  import Dialog from "primevue/dialog";
  import axios from "axios";
  import { useAppStore } from '@/stores/app-store';
  

  const store = useAppStore();
    const apiUrl = store.apiUrl;

  const apiClient = axios.create({
    baseURL: apiUrl, // URL del API Gateway
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  });
  
  apiClient.interceptors.request.use((config) => {
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
  const addModalVisible = ref(false);
  const editModalVisible = ref(false);
  const deleteModalVisible = ref(false);
  
  const newEspecialidad = ref({ nombre: "" });
  const editEspecialidad = ref({ id: null, nombre: "" });
  const especialidadToDelete = ref<{ id: number | null; nombre: string } | null>(null);
  
  // Obtener especialidades
  const getEspecialidades = async () => {
    try {
      const response = await apiClient.get("/admin/especialidades");
      especialidades.value = response.data;
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Error al obtener especialidades");
      } else {
        alert("Error al obtener especialidades");
      }
    }
  };
  
  // Abrir modal para agregar
  const openAddModal = () => {
    newEspecialidad.value = { nombre: "" };
    addModalVisible.value = true;
  };
  
  // Cerrar modal para agregar
  const closeAddModal = () => {
    addModalVisible.value = false;
  };
  
  // Guardar nueva especialidad
  const saveEspecialidad = async () => {
    try {
      console.log(JSON.parse(JSON.stringify(newEspecialidad.value)))
      await apiClient.post("/admin/especialidades",JSON.parse(JSON.stringify(newEspecialidad.value)) );
      await getEspecialidades(); 
      closeAddModal();
      alert("Especialidad creada exitosamente");
    } catch (error) {
      console.error("Error al guardar especialidad:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Error al guardar especialidad");
      } else {
        alert("Error al guardar especialidad");
      }
    }
  };
  
  // Abrir modal para editar
  const openEditModal = (especialidad: { id: null; nombre: string; } | { id: null; nombre: string; }) => {
    editEspecialidad.value = { ...especialidad };
    editModalVisible.value = true;
  };
  
  // Cerrar modal para editar
  const closeEditModal = () => {
    editModalVisible.value = false;
  };
  
  // Actualizar especialidad
  const updateEspecialidad = async () => {
    try {
      await apiClient.put(`/admin/especialidades/${editEspecialidad.value.id}`, editEspecialidad.value);
      await getEspecialidades(); // Refrescar la lista
      closeEditModal();
      alert("Especialidad actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar especialidad:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Error al actualizar especialidad");
      } else {
        alert("Error al actualizar especialidad");
      }
    }
  };
  
  // Abrir modal para eliminar
  const openDeleteModal = (especialidad: null) => {
    especialidadToDelete.value = especialidad;
    deleteModalVisible.value = true;
  };
  
  // Cerrar modal para eliminar
  const closeDeleteModal = () => {
    deleteModalVisible.value = false;
    especialidadToDelete.value = null;
  };
  
  // Eliminar especialidad
  const deleteEspecialidad = async () => {
    try {
      if (especialidadToDelete.value) {
        await apiClient.delete(`/admin/especialidades/${especialidadToDelete.value.id}`);
      }
      await getEspecialidades(); // Refrescar la lista
      closeDeleteModal();
      alert("Especialidad eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar especialidad:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Error al eliminar especialidad");
      } else {
        alert("Error al eliminar especialidad");
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
  
  .inputs {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .inputs input {
    width: 100%;
  }
  </style>