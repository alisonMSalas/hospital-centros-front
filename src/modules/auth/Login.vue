<template>
  <div class="login-container">
    <div class="left-container">
      <h1 class="login-title">Inicio de sesión</h1>
      <Form v-slot="$form" :initial-values="initialValues" :resolver="resolver" @submit="onFormSubmit">
        <div class="form-group">
          <div class="field">
            <InputText
              name="username"
              type="text"
              placeholder="Username"
              v-model="initialValues.username"
              class="input-field"
            />
            <Message
              v-if="$form.username?.invalid"
              class="error-message"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.username.error?.message }}
            </Message>
          </div>
          <div class="field">
            <InputText
              name="password"
              type="password"
              placeholder="Password"
              v-model="initialValues.password"
              class="input-field"
            />
            <Message
              v-if="$form.password?.invalid"
              class="error-message"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.password.error?.message }}
            </Message>
          </div>
        </div>
        <Button type="submit" class="submit-btn">Submit</Button>
      </Form>
    </div>

    <div class="right-container">
      <Image>
        <template #image>
          <img src="/src/assets/login-picture.png" alt="image" />
        </template>
      </Image>
    </div>

    <!-- Dialog for Admin to Select Medical Center -->
    <Dialog
      v-model:visible="showMedicalCenterDialog"
      header="Seleccionar Centro Médico"
      :modal="true"
      :style="{ width: '30rem' }"
    >
      <div class="dialog-content">
        <p>Por favor, seleccione el centro médico que desea administrar:</p>
        <Dropdown
          v-model="selectedMedicalCenter"
          :options="medicalCenters"
          option-label="name"
          option-value="id"
          placeholder="Seleccione un centro médico"
          class="w-full"
        />
      </div>
      <template #footer>
        <Button
          label="Confirmar"
          icon="pi pi-check"
          @click="confirmMedicalCenter"
          :disabled="!selectedMedicalCenter"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Form, type FormResolverOptions, type FormSubmitEvent } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Image from 'primevue/image';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import { useAppStore } from '@/stores/app-store';

interface FormValues {
  username: string;
  password: string;
}

interface MedicalCenter {
  id: number;
  name: string;
}

const router = useRouter();
const store = useAppStore();

const initialValues = ref<FormValues>({
  username: '',
  password: '',
});

const showMedicalCenterDialog = ref(false);
const medicalCenters = ref<MedicalCenter[]>([]);
const selectedMedicalCenter = ref<number | null>(null);

const apiUrl = store.apiUrl;

const resolver = ({ values }: FormResolverOptions): Record<string, any> => {
  const errors: Record<string, { message: string }[]> = {};

  if (!values.username) {
    errors.username = [{ message: 'El nombre de usuario es requerido.' }];
  }

  if (!values.password) {
    errors.password = [{ message: 'La contraseña es requerida.' }];
  }

  return {
    values,
    errors,
  };
};

const onFormSubmit = ({ valid }: FormSubmitEvent<Record<string, any>>): void => {
  if (valid) {
    login();
  }
};

const login = async () => {
  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialValues.value),
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    const data = await response.json();
    const payload = decodeToken(data.token);

    if (!payload || !payload.role) {
      throw new Error('Token inválido o sin rol');
    }

    store.token = data.token;
    localStorage.setItem('token', data.token);

    if (payload.role === 'admin') {
      medicalCenters.value = [
        { id: 2, name: 'Centro Médico Guayaquil' },
        { id: 3, name: 'Centro Médico Cuenca' },
      ];
      showMedicalCenterDialog.value = true;
    } else {
      router.push({ name: 'home' });
    }
  } catch (error: any) {
    alert(error.message || 'Error al iniciar sesión');
  }
};




const confirmMedicalCenter = () => {
  if (selectedMedicalCenter.value !== null) {
    store.centro = selectedMedicalCenter.value as unknown as string;
    localStorage.setItem('selectedMedicalCenter', selectedMedicalCenter.value.toString());
    showMedicalCenterDialog.value = false;
    router.push({ name: 'home' });
  } else {
    alert('Por favor, seleccione un centro médico.');
  }
};

function decodeToken(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
</script>

<style scoped lang="scss">
.login-container {
  padding: 5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  gap: 4rem;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  flex-wrap: wrap-reverse;
  margin: 4rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
}

.right-container {
  flex-shrink: 1;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;

  .p-image.p-component {
    display: flex;
    max-width: 100%;

    > img {
      width: 100%;
      max-height: 100%;
      border-radius: 12px;
    }
  }
}

.left-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.error-message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #d9534f;
}

.submit-btn {
  width: 100%;
  padding: 0.6rem;
  background-color: #4c9fff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #5a6268;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.w-full {
  width: 100%;
}
</style>
