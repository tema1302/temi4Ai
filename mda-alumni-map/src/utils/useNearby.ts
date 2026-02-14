import { ref } from 'vue';
import type { Person } from '../types';

export function useNearby() {
  const nearbyPeople = ref<Person[]>([]);
  const isLocating = ref(false);
  const geoError = ref<string | null>(null);

  const findNearby = (people: Person[], radiusKm: number = 50) => {
    if (!("geolocation" in navigator)) {
      geoError.value = "Геолокация не поддерживается вашим браузером";
      return;
    }

    isLocating.value = true;
    geoError.value = null;

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      
      nearbyPeople.value = people.filter(person => {
        const distance = getDistance(
          latitude, longitude, 
          person.coordinates[0], person.coordinates[1]
        );
        return distance <= radiusKm;
      });
      isLocating.value = false;
    }, (error) => {
      console.error(error);
      if (error.code === 1) {
        geoError.value = "Вы заблокировали доступ к GPS. Пожалуйста, разрешите доступ в настройках браузера, чтобы увидеть ближайших выпускников.";
      } else {
        geoError.value = "Не удалось определить ваше местоположение.";
      }
      isLocating.value = false;
    });
  };

  // Haversine formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; 
    return d;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  return { nearbyPeople, isLocating, geoError, findNearby };
}