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
                    <Button label="Eliminar filtros" icon="pi pi-times" variant="text" severity="info" @click="deleteFilters()" />
                    <Button label="Agregar" icon="pi pi-plus" @click="() => openModal()" />
                </div>
            </div>

            <DataTable :value="users" v-model:filters="filters" v-model:selection="selectedUser" :rows="5" paginator
                removableSort tableStyle="min-width: 50rem">
                <Column field="username" header="Usuario" :showFilterMenu="false" sortable />
                <Column field="role" header="Rol" :showFilterMenu="false" sortable />
                <Column header="Acciones">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" severity="info" variant="text" @click="() => openModal(slotProps.data)" />
                        <Button icon="pi pi-trash" severity="danger" variant="text" 
                                @click="() => deleteUser(slotProps.data.id)" />
                    </template>
                </Column>
                <template #empty>No se encontraron usuarios.</template>
            </DataTable>
        </div>
    </div>

    <!-- Modal -->
    <Dialog :header="isEditing ? 'Editar Usuario' : 'Crear Usuario'" v-model:visible="modalVisible" :modal="true" :closable="false"
    :dismissable-mask="true" :style="{ width: '37vw' }">
    <div class="inputs">
        <div class="username-password-container">
            <InputText 
                v-model="currentUser.username" 
                placeholder="Nombre de usuario" 
            />
            <Password 
                v-model="currentUser.password" 
                placeholder="Password" 
                toggleMask 
                :feedback="false" 
            />
        </div>

        <Dropdown 
            v-model="currentUser.role" 
            :options="roles" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Seleccionar rol" 
        />

        <Dropdown 
            v-if="currentUser.role === 'general'"
            v-model="currentUser.centro"
            :options="centros"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar centro médico"
        />
    </div>

    <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="closeModal" />
        <Button label="Guardar" icon="pi pi-check" @click="saveUser" />
    </template>
</Dialog>

</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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

// Filtros para la tabla
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Datos de la aplicación
const users = ref([]);
const selectedUser = ref();
const modalVisible = ref(false);
const isEditing = ref(false);

// Modelos de datos separados
const newUser = ref({
    id: '', // <-- agregado
    username: '',
    password: '',
    role: 'general',
    centro:0
    
});
const centros = ref([
   
    { label: 'Centro Médico Guayaquil', value: 2 },
    { label: 'Centro Médico Cuenca', value: 3 }
    
]);

const editingUser = ref({
    id: '',
    username: '',
    password: '',
    role: '',
    centro:0
});

// Computed para usar con v-model
const currentUser = computed({
    get: () => isEditing.value ? editingUser.value : newUser.value,
    set: (val) => {
        if (isEditing.value) {
            editingUser.value = val;
        } else {
            newUser.value = val;
        }
    }
});

// Opciones de roles
const roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'General', value: 'general' }
];

// Funciones de utilidad
const deleteFilters = () => {
    filters.value.global.value = null;
};

// Operaciones CRUD
const getUsers = async () => {
    try {
        const response = await axios.get(`${apiUrl}/auth/users`);
        users.value = response.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }
};

const openModal = (user?: any) => {
    if (user) {
        editingUser.value = {
            id: user.id,
            username: user.username,
            password: '',
            role: user.role,
            centro:user.centro
        };
        isEditing.value = true;
    } else {
        isEditing.value = false;
    }
    modalVisible.value = true;
};
const closeModal = () => {
    modalVisible.value = false;
    // Resetear ambos formularios incluyendo el id
    newUser.value = { id: '', username: '', password: '', role: 'general',centro:0 };
    editingUser.value = { id: '', username: '', password: '', role: '',centro:0 };
};


const saveUser = async () => {
    try {
        const current = currentUser.value;
        
        if (!current.username || (!isEditing.value && !current.password)) {
            alert("Username y password son requeridos");
            return;
        }
         if (current.role === 'admin') {
            current.centro = 1;
        }

        if (isEditing.value) {
            await axios.put(`${apiUrl}/auth/users/${editingUser.value.id}`, {
                username: editingUser.value.username,
                password: editingUser.value.password || undefined,
                role: editingUser.value.role,
                centro:editingUser.value.centro
            });
        } else {
            await axios.post(`${apiUrl}/auth/register`, {
                username: newUser.value.username,
                password: newUser.value.password,
                role: newUser.value.role,
                centro:current.centro
            });
        }

        await getUsers();
        closeModal();
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        alert("Error al guardar. Verifica los datos.");
    }
};

const deleteUser = async (userId: string) => {
    if (!userId) return;

    const confirmed = confirm('¿Estás seguro de eliminar este usuario?');
    if (!confirmed) return;

    try {
        await axios.delete(`${apiUrl}/auth/users/${userId}`);
        await getUsers();
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
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
    }
}

.inputs {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.username-password-container {
    display: flex;
    gap: 1.5rem;
}

.inputs input,
.inputs select,
.inputs .p-password {
    width: 100%;
}
</style>
