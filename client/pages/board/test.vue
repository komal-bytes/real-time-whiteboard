<template>
  <div class="flex flex-col items-center my-8">
    <h1 class="text-3xl mb-4">Whiteboard: {{ boardData.boardName }}</h1>
    <vue-drawing-canvas ref="drawingCanvas" v-model:image="image" :width="1500" :height="650"
      :stroke-type="canvaElements?.strokeType" :line-cap="canvaElements?.lineCap" :line-join="canvaElements?.lineJoin"
      :fill-shape="canvaElements?.fillShape" :eraser="canvaElements?.eraser" :lineWidth="canvaElements?.line"
      :color="canvaElements?.color" :background-color="canvaElements?.backgroundColor"
      :background-image="canvaElements?.backgroundImage" :initial-image="canvaElements?.initialImage" saveAs="png"
      :styles="{
        border: 'solid 1px #000',
      }" :lock="disabled" @mousemove="handleCanvasUpdate" />

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useWebSocket } from "~/composables/useWebSocket";
import VueDrawingCanvas from "vue-drawing-canvas";

const route = useRoute();
const boardId = ref(route.params.id);
const boardData = ref({});
const canvaElements = ref({
  initialImage: [
    {
      type: "dash",
      from: {
        x: 262,
        y: 154,
      },
      coordinates: [],
      color: "#000000",
      width: 5,
      fill: false,
    },
  ],
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

// watch(canvaElements, (newVal) => {
//   console.log('Canvas elements changed:', newVal);
// }, { deep: true });

const tool = ref('pencil');

const setTool = (selectedTool) => {
  tool.value = selectedTool;
};

const { connect, disconnect, sendMessage, isConnected, messages } =
  useWebSocket(boardId.value);

const drawingCanvas = ref(null);

const handleCanvasUpdate = async (event) => {
  const updatedElements = event.detail || event;

  canvaElements.value = {
    ...canvaElements.value,
    elements: updatedElements
  };

  sendMessage({
    type: "updateBoard",
    boardId: boardId.value,
    update: updatedElements
  });
};

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
  canvaElements.value = data.value.elements;
}

connect();
console.log(isConnected, "urllllllll")
</script>