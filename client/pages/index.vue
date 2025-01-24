<template>
  <div class="flex flex-col items-center space-y-4 m-8">
    <UButton @click="showModal = true" class="text-xl">Create Board</UButton>
    <UModal v-model="showModal">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <h3>Create Board</h3>
        </template>
        <UInput v-model="boardName" placeholder="Enter board name" />
        <template #footer>
          <div class="space-x-2 flex justify-end">
            <UButton @click="createBoard">Create</UButton>
            <UButton color="red" @click="showModal = false">Cancel</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
    <UCard v-if="boards.length" class="w-[500px] flex flex-col items-center">
      <h1 class="text-3xl mb-4">Boards</h1>
      <ul>
        <li v-for="board in boards" class="text-lg" :key="board.boardId">
          <router-link :to="`/board/${board.boardId}`">{{ board.boardName }}</router-link>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

const showModal = ref(false);
const boardName = ref('');
const boards = ref([]);

const createBoard = async () => {
  const { data, error } = await useCustomFetch('/createBoard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: boardName.value })
  });
  if (error.value) {
    toast.add({ title: error.value.message, color: "error" });
  } else {
    toast.add({ title: 'Board created successfully', color: "success" });
    showModal.value = false;
    router.push(`/board/${data.value.boardId}`);
  }
};

  const { data, error } = await useCustomFetch('/listOfBoards', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log(data.value, error.value, 'data and error');
  if (error.value) {
    toast.add({ title: error.value.message, color: "error" });
  } else {
    boards.value = data.value.boardList;
  }


watch([showModal, boardName], () => {
  console.log('Hello from the client!', showModal.value, boardName.value);
});
</script>
