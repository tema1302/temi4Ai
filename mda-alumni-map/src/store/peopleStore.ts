import { defineStore } from 'pinia';
import type { Person, Rank } from '../types';
import { MOCK_PEOPLE } from '../data/people';

export const usePeopleStore = defineStore('people', {
  state: () => ({
    people: MOCK_PEOPLE as Person[],
    pendingPeople: [] as Person[],
    searchQuery: '',
    selectedRank: null as Rank | null,
    selectedRegion: null as string | null,
  }),
  getters: {
    filteredPeople: (state) => {
      return state.people.filter(person => {
        const matchesSearch = person.fullName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                             person.address.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesRank = !state.selectedRank || person.rank === state.selectedRank;
        const matchesRegion = !state.selectedRegion || person.regionSlug === state.selectedRegion;
        return matchesSearch && matchesRank && matchesRegion;
      });
    }
  },
  actions: {
    async fetchPeople() {
      try {
        const res = await fetch('/api/alumni');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        this.people = data;
      } catch (e) {
        console.error('Failed to fetch alumni', e);
      }
    },
    async fetchPendingPeople() {
      try {
        const token = localStorage.getItem('mda_admin_token');
        const res = await fetch('/api/admin/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch pending');
        const data = await res.json();
        this.pendingPeople = data;
      } catch (e) {
        console.error('Failed to fetch pending people', e);
      }
    },
    addPendingPerson(person: Person) {
      this.pendingPeople.push(person);
    },
    async approvePerson(id: number) {
      try {
        const token = localStorage.getItem('mda_admin_token');
        const res = await fetch(`/api/admin/approve/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const idx = this.pendingPeople.findIndex(p => p.id === id);
          if (idx !== -1) {
            const person = this.pendingPeople.splice(idx, 1)[0];
            this.people.push({ ...person, isVerified: true });
          }
        }
      } catch (e) {
        console.error('Approve failed', e);
      }
    },
    async rejectPerson(id: number) {
      try {
        const token = localStorage.getItem('mda_admin_token');
        const res = await fetch(`/api/admin/reject/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          this.pendingPeople = this.pendingPeople.filter(p => p.id !== id);
        }
      } catch (e) {
        console.error('Reject failed', e);
      }
    },
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },
    setSelectedRank(rank: Rank | null) {
      this.selectedRank = rank;
    },
    setSelectedRegion(region: string | null) {
      this.selectedRegion = region;
    }
  }
});
