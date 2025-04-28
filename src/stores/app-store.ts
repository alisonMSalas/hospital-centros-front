import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', () => {

  const token = ref<string>(localStorage.getItem('token') || '');
  const centro = ref<string>(localStorage.getItem('centro') || '');

  const apiUrl = ref('http://34.23.223.70:3000/api');


  watch(token, (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setCentro();

    } else {
      localStorage.removeItem('token');
    }
  });

  function setToken(newToken: string) {
    token.value = newToken;
  }

  function getCentro(){
    if(token.value){
      const payload = JSON.parse(atob(token.value.split('.')[1]));
      centro.value = payload.centro;
      localStorage.getItem( centro.value);
    }
  }

  function setCentro(){
    if(token.value){
      const payload = JSON.parse(atob(token.value.split('.')[1]));
      centro.value = payload.centro;
      localStorage.setItem('centro', centro.value);
    }
  }

  function decodeToken(token: string) {
    try {
      const base64Payload = token.split('.')[1];
      const payload = atob(base64Payload);
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  function clearToken() {
    token.value = '';
  }

  return {
    token,
    apiUrl, 
    setToken,
    clearToken,
    centro
  };
});
