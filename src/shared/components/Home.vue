<template>
  <h1 class="m-5">Home</h1>
  <p class="mb-2">Bienvenido a la aplicación de gestión de centros médicos.</p>
  <p class="text-lg">Utiliza el menú para navegar por las diferentes secciones.</p>
  <p class="text-lg">Desarrollado por FRAM</p>
  <Galleria
    :value="images"
    :responsiveOptions="responsiveOptions"
    :numVisible="5"
    :circular="true"
    containerStyle="max-width: 640px"
    :showItemNavigators="true"
    :showThumbnails="false"
  >
    <template #item="slotProps">
      <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="width: 100%" />
    </template>
    <template #thumbnail="slotProps">
      <img
        :src="slotProps.item.thumbnailImageSrc"
        :alt="slotProps.item.alt"
        style="display: block"
      />
    </template>
  </Galleria>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Galleria from 'primevue/galleria';

const images = ref([
  {
    itemImageSrc:
      'https://espanol.atlantichealth.org/content/dam/ahs/location-photography/ahs-locations/hospitals/chilton_medical_center.jpg',
    alt: 'Chilton Medical Center',
  },
  {
    itemImageSrc:
      'https://i0.wp.com/www.medicalcenter.com.uy/wp-content/uploads/2023/04/medical-center1.jpg?fit=970%2C596&ssl=1',
    thumbnailImageSrc:
      'https://i0.wp.com/www.medicalcenter.com.uy/wp-content/uploads/2023/04/medical-center1.jpg?fit=970%2C596&ssl=1',
    alt: 'Medical Center Uruguay',
  },
]);
const responsiveOptions = ref([
  {
    breakpoint: '1300px',
    numVisible: 4,
  },
  {
    breakpoint: '575px',
    numVisible: 1,
  },
]);
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  text-align: center;
}
</style>
