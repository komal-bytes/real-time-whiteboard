<template>
  <div class="flex flex-col items-center my-8">
    <h1 class="text-3xl mb-4">Whiteboard: {{ boardData.boardName }}</h1>
    <vue-drawing-canvas ref="drawingCanvas" v-model:image="canvaElements.image" :width="1500" :height="650"
      :stroke-type="canvaElements?.strokeType" :line-cap="canvaElements?.lineCap" :line-join="canvaElements?.lineJoin"
      :fill-shape="canvaElements?.fillShape" :eraser="canvaElements?.eraser" :lineWidth="canvaElements?.line"
      :color="canvaElements?.color" :background-color="canvaElements?.backgroundColor"
      :background-image="canvaElements?.backgroundImage" :initial-image="initialImage" saveAs="png"
      :styles="{
        border: 'solid 1px #000',
      }" :lock="disabled" />

  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useWebSocket } from "~/composables/useWebSocket";
import VueDrawingCanvas from "vue-drawing-canvas";

const drawingCanvas = ref(null);
const route = useRoute();
const boardId = ref(route.params.id);
const boardData = ref({});
const initialImage = ref([]);
const canvaElements = ref({
  x: 0,
  y: 0,
  image: "",
  eraser: false,
  disabled: false,
  fillShape: false,
  line: 5,
  color: "#000000",
  strokeType: "dash",
  lineCap: "square",
  lineJoin: "miter",
  backgroundColor: "#FFFFFF",
  backgroundImage: null,
})
const strokes = ref(0);

watch(canvaElements, async (newVal) => {
  console.log(drawingCanvas.value, 'drawing canvas');
  if (!drawingCanvas.value) return;
  console.log("come hereeeee")
  const currentStrokes = drawingCanvas.value?.getAllStrokes();
  const newStrokes = currentStrokes.slice(strokes.value);
  console.log(newStrokes, 'come here');
  if (newStrokes.length > 0) {
    
    await sendMessage({
      type: "updateBoard",
      boardId: boardId.value,
      update: newStrokes
    });
    strokes.value = currentStrokes.length;
  }
}, { deep: true });


const { connect, sendMessage, messages } = useWebSocket(boardId.value);

const { data, error } = await useCustomFetch(`/board/${boardId.value}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log(data.value, error.value, 'data and error');
if (error.value) {
  toast.add({ title: error.value.message, color: "error" });
} else {
  boardData.value = data.value.boardData;
  initialImage.value = data.value.boardData.elements;
}

// Watch for new messages from WebSocket
watch(messages, (newMessages) => {
  console.log(newMessages, 'new messages');
  if (newMessages.length > 0) {
    const latestMessage = newMessages[newMessages.length - 1];
    if (latestMessage.type === 'updateBoard' && latestMessage.boardId === boardId.value) {
      console.log(initialImage.value, "new messages")
      console.log(latestMessage.update, "new messages");
      initialImage.value.push(...latestMessage.update);
      drawingCanvas.value.drawInitialImage();
      strokes.value += latestMessage.update.length;
    }
  }
}, { deep: true });

onMounted(() => {
  connect();
});

</script>