<template>
  <div class="flex items-center justify-center h-screen">
    <Bar
      :chart-options="chartOptions"
      :chart-data="chartData"
      :chart-id="chartId"
      :dataset-id-key="datasetIdKey"
      :plugins="plugins"
      :css-classes="cssClasses"
      :styles="styles"
      :width="width"
      :height="height"
    />
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default {
  name: "BarChart",
  components: { Bar },
  props: {
    chartId: {
      type: String,
      default: "bar-chart",
    },
    datasetIdKey: {
      type: String,
      default: "label",
    },
    width: {
      type: Number,
      default: 600,
    },
    height: {
      type: Number,
      default: 400,
    },
    cssClasses: {
      default: "",
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Object,
      default: () => {},
    },
  },
  async mounted() {
    try {
      const res = await fetch("http://localhost:8000/quiz/score/1");
      const resJson = await res.json();
      this.chartData.datasets.push({
        label: "Users",
        data: resJson.data,
        backgroundColor: "#f87979",
      });
    } catch (error) {
      console.log(error);
    }
  },
  data() {
    return {
      chartData: {
        labels: [
          "100%-90%",
          "90%-80%",
          "80%-70%",
          "70%-60%",
          "60%-50%",
          "50%-40%",
          "40%-30%",
          "30%-20%",
          "20%-10%",
          "10%-0%",
        ],
        datasets: [],
      },
      chartOptions: {
        responsive: true,
        indexAxis: "y",
        plugins: {
          legend: {
            position: "right",
          },
          title: {
            display: true,
            text: "Quiz Scores",
          },
        },
      },
    };
  },
};
</script>
