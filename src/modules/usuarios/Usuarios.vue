<template>
    <h1 class="m-5">Control de Usuarios</h1>
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
                    <Button label="Eliminar filtros" icon="pi pi-times" variant="text" severity="info"
                        @click="deleteFilters()" />
                    <Button label="Agregar" icon="pi pi-plus" @click="openModal" />
                </div>
            </div>

            <DataTable :value="users" v-model:filters="filters" v-model:selection="selectedUser" :rows="5" paginator
                removableSort tableStyle="min-width: 50rem">
                <Column field="username" header="Usuario" :showFilterMenu="false" sortable />
                <Column field="role" header="Rol" :showFilterMenu="false" sortable />
                <Column header="Acciones">
                    <template #body>
                        <Button icon="pi pi-pencil" severity="info" variant="text" />
                        <Button icon="pi pi-trash" severity="danger" variant="text" />
                    </template>
                </Column>

                <template #empty>No se encontraron usuarios.</template>
            </DataTable>
        </div>
    </div>

    <!-- Modal para agregar un nuevo usuario -->
    <Dialog header="Crear Usuario" v-model:visible="modalVisible" :modal="true" :closable="false"
        :dismissable-mask="true" :style="{ width: '37vw'  }">
        <div class="inputs">
            <div class="username-password-container">
                <InputText v-model="newUser.username" placeholder="Nombre de usuario" />
                <Password v-model="newUser.password" placeholder="Password" toggleMask :feedback="false" />
            </div>
            <Dropdown v-model="newUser.role" :options="roles" optionLabel="label" optionValue="value"
                placeholder="Seleccionar rol" />

        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="closeModal" />
            <Button label="Guardar" icon="pi pi-check" @click="saveUser" />
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
import Dropdown from 'primevue/dropdown';

import Password from 'primevue/password';
import { useAppStore } from '@/stores/app-store';


const store = useAppStore();
const apiUrl = store.apiUrl;

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const deleteFilters = () => {
    filters.value.global.value = null;
};

const users = ref([]);
const selectedUser = ref();
const modalVisible = ref(false);
const newUser = ref({ username: '', password: '', role: '' });
const roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'General', value: 'general' }
];


const getUsers = async () => {
    try {
        const response = await axios.get(`${apiUrl}/auth/users`);
        users.value = response.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }
};

const openModal = () => {
    modalVisible.value = true; 
    
};

const closeModal = () => {
    modalVisible.value = false;  
};

const saveUser = async () => {
    try {
        await axios.post(`${apiUrl}/auth/register`, newUser.value);  
        users.value.push(newUser.value); 
        closeModal(); 
        newUser.value = { username: '', role: '' }; 
    } catch (error) {
        console.error('Error al guardar usuario:', error);
    }
};

onMounted(() => {
    getUsers();
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
    flex-direction: column; /* El contenedor general se apilará en columna */
    gap: 1.5rem;  /* Espacio entre los elementos */
}

.username-password-container {
    display: flex;
    gap: 1.5rem;  /* Espacio entre el input de usuario y el de contraseña */
}

.inputs input, 
.inputs select, 
.inputs .p-password {
    width: 100%;  /* Asegura que los inputs y select ocupen todo el ancho disponible */
}

</style>
